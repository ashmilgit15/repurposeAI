import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceTrustedOrigin } from "@/lib/security/request";
import { enforceUserRateLimit } from "@/lib/security/rate-limit";
import { parsePublicHttpUrl } from "@/lib/security/url";
import { scrapeUrl } from "@/lib/scraper";

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

    // Scrape with Firecrawl → fallback strategy
    const result = await scrapeUrl(targetUrl.toString());

    return NextResponse.json({
      success: true,
      content: result.content,
      title: result.title || "Untitled",
      url: targetUrl.toString(),
    });
  } catch (error) {
    console.error("Error scraping URL:", error);
    const message =
      error instanceof Error ? error.message : "Failed to scrape URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
