import "server-only";

import { NextResponse } from "next/server";

function getAllowedOrigins(request: Request): Set<string> {
  const allowedOrigins = new Set<string>([new URL(request.url).origin]);
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredAppUrl) {
    try {
      allowedOrigins.add(new URL(configuredAppUrl).origin);
    } catch {
      // Ignore malformed configuration and continue validating against the request origin.
    }
  }

  return allowedOrigins;
}

export function enforceTrustedOrigin(request: Request): NextResponse | null {
  const allowedOrigins = getAllowedOrigins(request);
  const origin = request.headers.get("origin");

  if (origin) {
    if (allowedOrigins.has(origin)) {
      return null;
    }

    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowedOrigins.has(refererOrigin)) {
        return null;
      }
    } catch {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }
  }

  return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
}
