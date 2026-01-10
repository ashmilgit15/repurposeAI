import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Firecrawl API not configured" },
        { status: 500 }
      );
    }

    // Call Firecrawl API to scrape the URL
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: url,
        formats: ["markdown"],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Firecrawl API error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Failed to scrape URL" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || "Failed to scrape URL" },
        { status: 400 }
      );
    }

    // Extract the markdown content
    const content = data.data?.markdown || data.data?.content || "";

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "No content found at this URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content: content,
      title: data.data?.metadata?.title || "Untitled",
      url: url,
    });
  } catch (error) {
    console.error("Error scraping URL:", error);
    return NextResponse.json(
      { error: "Failed to scrape URL" },
      { status: 500 }
    );
  }
}
