import "server-only";

import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";

/**
 * Scrape a URL and extract its main text content as markdown.
 *
 * Strategy:
 *   1. Try Firecrawl API (best quality, handles JS-rendered pages)
 *   2. Fall back to direct fetch + cheerio HTML parsing
 *
 * Firecrawl 429 / 5xx errors are treated as transient and trigger the
 * fallback automatically so the user never sees "rate limited".
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScrapeResult {
  content: string;
  title: string;
  source: "firecrawl" | "fallback";
}

// ---------------------------------------------------------------------------
// Firecrawl
// ---------------------------------------------------------------------------

async function scrapeWithFirecrawl(
  url: string,
  apiKey: string,
): Promise<ScrapeResult | null> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify({
        url,
        formats: ["markdown"],
      }),
    });

    // Rate-limited or server error → let caller fall back
    if (response.status === 429 || response.status >= 500) {
      console.warn(
        `Firecrawl returned ${response.status} – falling back to direct scrape`,
      );
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Firecrawl API error:", errorData);
      return null;
    }

    const data = await response.json();

    if (!data.success) {
      console.warn("Firecrawl returned success:false –", data.error);
      return null;
    }

    const content = data.data?.markdown || data.data?.content || "";
    if (!content || content.trim().length === 0) {
      return null;
    }

    return {
      content,
      title: data.data?.metadata?.title || "",
      source: "firecrawl",
    };
  } catch (error) {
    // Timeout or network error → fall back
    console.warn("Firecrawl request failed:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fallback: direct fetch + cheerio
// ---------------------------------------------------------------------------

/** Tags we strip entirely (including children) */
const REMOVE_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "iframe",
  "svg",
  "nav",
  "footer",
  "header",
  "aside",
  "form",
  "button",
  "input",
  "select",
  "textarea",
]);

/** Inline tags that should just be unwrapped (keep text, drop tag) */
const INLINE_TAGS = new Set([
  "span",
  "em",
  "i",
  "strong",
  "b",
  "u",
  "mark",
  "small",
  "sub",
  "sup",
  "abbr",
  "cite",
  "time",
]);

function htmlToMarkdown($: cheerio.CheerioAPI, root: cheerio.Cheerio<AnyNode>): string {
  const lines: string[] = [];

  function walk(el: cheerio.Cheerio<AnyNode>) {
    el.contents().each((_, node) => {
      if (node.type === "text") {
        const text = $(node).text().replace(/\s+/g, " ");
        if (text.trim()) {
          lines.push(text.trim());
        }
        return;
      }

      if (node.type !== "tag") return;

      const tag = (node as Element).tagName?.toLowerCase();
      if (!tag) return;

      if (REMOVE_TAGS.has(tag)) return;

      const $el = $(node);

      if (INLINE_TAGS.has(tag)) {
        walk($el);
        return;
      }

      switch (tag) {
        case "h1":
          lines.push(`\n# ${$el.text().trim()}\n`);
          break;
        case "h2":
          lines.push(`\n## ${$el.text().trim()}\n`);
          break;
        case "h3":
          lines.push(`\n### ${$el.text().trim()}\n`);
          break;
        case "h4":
        case "h5":
        case "h6":
          lines.push(`\n#### ${$el.text().trim()}\n`);
          break;
        case "p":
        case "div":
        case "section":
        case "article":
        case "main":
          walk($el);
          lines.push("\n");
          break;
        case "br":
          lines.push("\n");
          break;
        case "li":
          lines.push(`- ${$el.text().trim()}`);
          break;
        case "blockquote":
          lines.push(`> ${$el.text().trim()}\n`);
          break;
        case "a": {
          const href = $el.attr("href");
          const text = $el.text().trim();
          if (text && href && !href.startsWith("#") && !href.startsWith("javascript:")) {
            lines.push(`[${text}](${href})`);
          } else if (text) {
            lines.push(text);
          }
          break;
        }
        case "pre":
        case "code":
          lines.push(`\n\`\`\`\n${$el.text().trim()}\n\`\`\`\n`);
          break;
        case "img": {
          const alt = $el.attr("alt");
          if (alt) lines.push(`[Image: ${alt}]`);
          break;
        }
        default:
          walk($el);
          break;
      }
    });
  }

  walk(root);

  // Collapse excessive newlines
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function scrapeWithFallback(url: string): Promise<ScrapeResult | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RepurposeAI/1.0; +https://repurpose-ai.vercel.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Direct fetch failed with status ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      console.warn("Response is not HTML:", contentType);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    REMOVE_TAGS.forEach((tag) => $(tag).remove());
    $("[role='navigation']").remove();
    $("[role='banner']").remove();
    $("[role='contentinfo']").remove();
    $(".sidebar, .nav, .footer, .header, .menu, .ad, .ads, .advertisement, .cookie-banner, .popup").remove();

    // Try to find the main content area
    const mainSelectors = [
      "article",
      "[role='main']",
      "main",
      ".post-content",
      ".article-content",
      ".entry-content",
      ".content",
      ".post-body",
      "#content",
      "#main-content",
    ];

    let contentRoot: cheerio.Cheerio<AnyNode> | null = null;
    for (const selector of mainSelectors) {
      const el = $(selector);
      if (el.length > 0 && el.text().trim().length > 100) {
        contentRoot = el.first();
        break;
      }
    }

    // Fallback to body
    if (!contentRoot) {
      contentRoot = $("body");
    }

    const title =
      $("meta[property='og:title']").attr("content") ||
      $("title").text().trim() ||
      $("h1").first().text().trim() ||
      "";

    const markdown = htmlToMarkdown($, contentRoot);

    if (!markdown || markdown.length < 50) {
      console.warn("Extracted content too short");
      return null;
    }

    return {
      content: markdown,
      title,
      source: "fallback",
    };
  } catch (error) {
    console.error("Fallback scrape failed:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;

  // 1. Try Firecrawl if configured
  if (firecrawlKey) {
    const firecrawlResult = await scrapeWithFirecrawl(url, firecrawlKey);
    if (firecrawlResult) {
      return firecrawlResult;
    }
    console.log("Firecrawl unavailable, trying fallback scraper…");
  }

  // 2. Fallback to direct scraping
  const fallbackResult = await scrapeWithFallback(url);
  if (fallbackResult) {
    return fallbackResult;
  }

  throw new Error(
    "Unable to extract content from this URL. The page may require JavaScript or block automated access.",
  );
}
