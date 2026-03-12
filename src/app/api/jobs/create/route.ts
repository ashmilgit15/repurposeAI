import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { generatePrompt } from "@/lib/prompts";
import { FREE_TIER_LIMIT, FREE_TIER_FORMATS, PLATFORM_INFO, type Platform } from "@/lib/types";
import { enforceTrustedOrigin } from "@/lib/security/request";
import { enforceUserRateLimit } from "@/lib/security/rate-limit";

// AI Provider types
type AIProvider = "gemini" | "groq";

interface GenerationResult {
  content: string;
  provider: AIProvider;
}

const ALLOWED_BRAND_VOICES = new Set([
  "professional",
  "casual",
  "friendly",
  "authoritative",
  "witty",
]);
const MAX_INPUT_TEXT_LENGTH = 50_000;
const ALLOWED_FORMATS = new Set(Object.keys(PLATFORM_INFO) as Platform[]);

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
    const originError = enforceTrustedOrigin(request);
    if (originError) {
      return originError;
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitError = await enforceUserRateLimit(supabase, {
      bucket: "jobs:create",
      limit: 12,
      windowSeconds: 600,
      message: "Too many content generation requests. Please wait a few minutes and try again.",
    });
    if (rateLimitError) {
      return rateLimitError;
    }

    // Get request body
    const requestBody = await request.json().catch(() => null);
    const input_text = typeof requestBody?.input_text === "string" ? requestBody.input_text.trim() : "";
    const brand_voice =
      typeof requestBody?.brand_voice === "string" ? requestBody.brand_voice : "professional";
    const rawFormats = Array.isArray(requestBody?.selected_formats)
      ? requestBody.selected_formats
      : [];
    const selected_formats = Array.from(new Set(rawFormats)).filter(
      (format): format is Platform => typeof format === "string" && ALLOWED_FORMATS.has(format as Platform)
    );

    // Validate input
    if (!input_text || input_text.length < 100) {
      return NextResponse.json(
        { error: "Content must be at least 100 characters" },
        { status: 400 }
      );
    }

    if (input_text.length > MAX_INPUT_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be ${MAX_INPUT_TEXT_LENGTH.toLocaleString()} characters or fewer` },
        { status: 400 }
      );
    }

    if (!ALLOWED_BRAND_VOICES.has(brand_voice)) {
      return NextResponse.json(
        { error: "Invalid brand voice selection" },
        { status: 400 }
      );
    }

    if (selected_formats.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one output format" },
        { status: 400 }
      );
    }

    if (selected_formats.length !== rawFormats.length) {
      return NextResponse.json(
        { error: "One or more selected formats are invalid" },
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
    const generationResults = await Promise.all(
      selected_formats.map(async (format: string) => {
        try {
          const prompt = generatePrompt(format, input_text, brand_voice);
          const result = await generateContentWithFallback(prompt);
          return {
            format,
            content: result.content,
            provider: result.provider,
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error generating ${format}:`, errorMessage);

          if (errorMessage.includes("API key") || errorMessage.includes("configured")) {
            return {
              format,
              content: "AI service configuration error. Please contact support.",
              provider: null,
            };
          }

          if (errorMessage.includes("rate") || errorMessage.includes("limit")) {
            return {
              format,
              content: "Rate limit reached. Please try again in a moment.",
              provider: null,
            };
          }

          if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
            return {
              format,
              content: "Content was flagged by safety filters. Try modifying your input.",
              provider: null,
            };
          }

          return {
            format,
            content: `Error generating content for ${format}. Please try again later.`,
            provider: null,
          };
        }
      })
    );

    const outputs: Record<string, string> = {};
    const providersUsed = new Set<AIProvider>();

    for (const result of generationResults) {
      outputs[result.format] = result.content;
      if (result.provider) {
        providersUsed.add(result.provider);
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
      provider: Array.from(providersUsed)[0] ?? null,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
