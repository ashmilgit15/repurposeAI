import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { generatePrompt } from "@/lib/prompts";
import { FREE_TIER_LIMIT, FREE_TIER_FORMATS } from "@/lib/types";

// AI Provider types
type AIProvider = "gemini" | "groq";

interface GenerationResult {
  content: string;
  provider: AIProvider;
}

// Generate content using Gemini (Primary)
async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Generate content using Groq (Fallback)
async function generateWithGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not configured");
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content || "";
}

// Generate content with fallback system
async function generateContentWithFallback(prompt: string): Promise<GenerationResult> {
  // Try Gemini first (Primary)
  try {
    console.log("Attempting generation with Gemini (primary)...");
    const content = await generateWithGemini(prompt);
    console.log("Gemini generation successful");
    return { content, provider: "gemini" };
  } catch (geminiError: unknown) {
    const geminiMessage = geminiError instanceof Error ? geminiError.message : String(geminiError);
    console.log(`Gemini failed: ${geminiMessage.substring(0, 100)}...`);
    console.log("Falling back to Groq...");
  }

  // Fallback to Groq
  try {
    const content = await generateWithGroq(prompt);
    console.log("Groq generation successful (fallback)");
    return { content, provider: "groq" };
  } catch (groqError: unknown) {
    const groqMessage = groqError instanceof Error ? groqError.message : String(groqError);
    console.error(`Groq also failed: ${groqMessage}`);
    throw new Error(`All AI providers failed. Last error: ${groqMessage}`);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { input_text, selected_formats, brand_voice = "professional" } = await request.json();

    // Validate input
    if (!input_text || input_text.length < 100) {
      return NextResponse.json(
        { error: "Content must be at least 100 characters" },
        { status: 400 }
      );
    }

    if (!selected_formats || selected_formats.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one output format" },
        { status: 400 }
      );
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check and reset usage if needed
    const now = new Date();
    const resetDate = new Date(userData.jobs_reset_date);
    let jobsThisMonth = userData.jobs_this_month;

    if (now >= resetDate) {
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setDate(1);
      nextReset.setHours(0, 0, 0, 0);

      await supabase
        .from("users")
        .update({
          jobs_this_month: 0,
          jobs_reset_date: nextReset.toISOString(),
        })
        .eq("id", user.id);

      jobsThisMonth = 0;
    }

    // Check usage limit for free users
    if (userData.subscription_tier === "free" && jobsThisMonth >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        { error: "You've reached your free limit. Please upgrade to Pro for unlimited jobs." },
        { status: 403 }
      );
    }

    // Check if free user is trying to use pro formats
    if (userData.subscription_tier === "free") {
      const invalidFormats = selected_formats.filter(
        (f: string) => !FREE_TIER_FORMATS.includes(f)
      );
      if (invalidFormats.length > 0) {
        return NextResponse.json(
          { error: `These formats require Pro: ${invalidFormats.join(", ")}` },
          { status: 403 }
        );
      }
    }

    // Check if at least one AI provider is configured
    if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "No AI service configured" },
        { status: 500 }
      );
    }

    // Generate content for each format with fallback
    const outputs: Record<string, string> = {};
    let usedProvider: AIProvider = "gemini";

    for (const format of selected_formats) {
      try {
        const prompt = generatePrompt(format, input_text, brand_voice);
        const result = await generateContentWithFallback(prompt);
        outputs[format] = result.content;
        usedProvider = result.provider;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error generating ${format}:`, errorMessage);

        // Provide user-friendly error messages
        if (errorMessage.includes("API key") || errorMessage.includes("configured")) {
          outputs[format] = `AI service configuration error. Please contact support.`;
        } else if (errorMessage.includes("rate") || errorMessage.includes("limit")) {
          outputs[format] = `Rate limit reached. Please try again in a moment.`;
        } else if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
          outputs[format] = `Content was flagged by safety filters. Try modifying your input.`;
        } else {
          outputs[format] = `Error generating content for ${format}. Please try again later.`;
        }
      }
    }

    // Save job to database
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        user_id: user.id,
        input_text,
        input_method: "paste",
        brand_voice,
        selected_formats,
        outputs,
      })
      .select()
      .single();

    if (jobError) {
      console.error("Error saving job:", jobError);
      return NextResponse.json(
        { error: "Failed to save job" },
        { status: 500 }
      );
    }

    // Increment jobs_this_month
    await supabase
      .from("users")
      .update({ jobs_this_month: jobsThisMonth + 1 })
      .eq("id", user.id);

    return NextResponse.json({
      job_id: job.id,
      outputs,
      provider: usedProvider, // Let client know which provider was used
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
