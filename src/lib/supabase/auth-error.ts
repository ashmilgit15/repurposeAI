import { AuthError } from "@supabase/supabase-js";

const AUTH_SERVICE_UNAVAILABLE_MESSAGE =
  "Authentication service is unavailable right now. Check that your Supabase project is active and that NEXT_PUBLIC_SUPABASE_URL points to the correct project.";

export function formatSupabaseAuthError(
  error: unknown,
  fallback = "Authentication failed. Please try again."
) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof AuthError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (/failed to fetch/i.test(error.message)) {
      return AUTH_SERVICE_UNAVAILABLE_MESSAGE;
    }

    return error.message || fallback;
  }

  return fallback;
}

export function isSupabaseFetchError(error: unknown) {
  return error instanceof Error && /failed to fetch/i.test(error.message);
}

export async function withSupabaseAuthRetry<T>(
  action: () => Promise<T>,
  retries = 1,
  retryDelayMs = 500
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;

      if (!isSupabaseFetchError(error) || attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw lastError;
}
