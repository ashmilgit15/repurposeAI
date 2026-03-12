import "server-only";

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

interface RateLimitOptions {
  bucket: string;
  limit: number;
  windowSeconds: number;
  message: string;
}

interface RateLimitRow {
  allowed: boolean;
  remaining: number;
  reset_at: string;
}

export async function enforceUserRateLimit(
  supabase: SupabaseClient,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_bucket: options.bucket,
    p_window_seconds: options.windowSeconds,
    p_max_requests: options.limit,
  });

  if (error) {
    console.error(`Rate limiter failed for ${options.bucket}:`, error.message);
    return NextResponse.json(
      { error: "Rate limiting is temporarily unavailable" },
      { status: 503 }
    );
  }

  const result = Array.isArray(data) ? (data[0] as RateLimitRow | undefined) : (data as RateLimitRow | null);
  if (!result?.allowed) {
    const resetAt = result?.reset_at ? new Date(result.reset_at) : null;
    const retryAfterSeconds = resetAt
      ? Math.max(Math.ceil((resetAt.getTime() - Date.now()) / 1000), 1)
      : options.windowSeconds;

    return NextResponse.json(
      { error: options.message },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      }
    );
  }

  return null;
}
