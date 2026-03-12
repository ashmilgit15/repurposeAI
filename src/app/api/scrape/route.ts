import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceTrustedOrigin } from "@/lib/security/request";
import { enforceUserRateLimit } from "@/lib/security/rate-limit";
import { parsePublicHttpUrl } from "@/lib/security/url";

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
      bucket: "scrape:create",
      limit: 10,
      windowSeconds: 600,
      message: "Too many scrape requests. Please wait a few minutes and try again.",
    });
    if (rateLimitError) {
      return rateLimitError;
    }

    const requestBody = await request.json().catch(() => null);
    let targetUrl: URL;
    try {
      targetUrl = parsePublicHttpUrl(requestBody?.url);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid URL format" },
        { status: 400 }
      );
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
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        url: targetUrl.toString(),
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
      url: targetUrl.toString(),
    });
  } catch (error) {
    console.error("Error scraping URL:", error);
    return NextResponse.json(
      { error: "Failed to scrape URL" },
      { status: 500 }
    );
  }
}
