import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generatePrompt } from "@/lib/prompts";
import { FREE_TIER_LIMIT, FREE_TIER_FORMATS } from "@/lib/types";

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

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content for each format
    const outputs: Record<string, string> = {};

    for (const format of selected_formats) {
      try {
        const prompt = generatePrompt(format, input_text, brand_voice);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        outputs[format] = response.text();
      } catch (error) {
        console.error(`Error generating ${format}:`, error);
        outputs[format] = `Error generating content for ${format}. Please try again.`;
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
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
