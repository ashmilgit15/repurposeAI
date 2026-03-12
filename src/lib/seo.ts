import type { Metadata } from "next";

const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || DEFAULT_SITE_URL;

  const url = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  return normalizeBaseUrl(url);
}

function uniqueKeywords(keywords: readonly string[]) {
  return Array.from(new Set(keywords));
}

export const siteConfig = {
  name: "RepurposeAI",
  shortName: "RepurposeAI",
  url: getSiteUrl(),
  title: "AI Content Repurposing Tool for Blog-to-Social Workflows",
  description:
    "RepurposeAI turns one blog post, article, or newsletter into platform-ready content for X, LinkedIn, Instagram, email, and more.",
  supportEmail: "support@repurpose.ai",
  keywords: [
    "AI content repurposing",
    "content repurposing tool",
    "blog post to social media posts",
    "social media post generator",
    "AI content marketing tool",
    "RepurposeAI",
  ] as const,
  socialImagePath: "/opengraph-image",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export const defaultRobots: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  return {
    title,
    description,
    keywords: uniqueKeywords([...siteConfig.keywords, ...keywords]),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: absoluteUrl(siteConfig.socialImagePath),
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} social preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(siteConfig.socialImagePath)],
    },
    robots: defaultRobots,
  };
}

export function buildNoIndexMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-image-preview": "none",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}
