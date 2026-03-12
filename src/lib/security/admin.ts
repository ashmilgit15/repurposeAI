import "server-only";

import type { SupabaseClient, User as SupabaseAuthUser } from "@supabase/supabase-js";

function parseEnvList(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

function getAdminUserIds(): Set<string> {
  return parseEnvList(process.env.ADMIN_USER_IDS);
}

function getAdminEmails(): Set<string> {
  return parseEnvList(process.env.ADMIN_USER_EMAILS);
}

export function isAdminConfigured(): boolean {
  return getAdminUserIds().size > 0 || getAdminEmails().size > 0;
}

export function isAdminUser(user: SupabaseAuthUser): boolean {
  const adminUserIds = getAdminUserIds();
  const adminEmails = getAdminEmails();
  const normalizedEmail = user.email?.trim().toLowerCase();

  return adminUserIds.has(user.id) || (normalizedEmail ? adminEmails.has(normalizedEmail) : false);
}

export async function getAuthenticatedAdminUser(
  supabase: SupabaseClient
): Promise<SupabaseAuthUser | null> {
  if (!isAdminConfigured()) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return null;
  }

  return user;
}
