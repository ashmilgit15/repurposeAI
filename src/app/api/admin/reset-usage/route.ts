import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedAdminUser } from "@/lib/security/admin";
import { enforceTrustedOrigin } from "@/lib/security/request";
import { enforceUserRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const originError = enforceTrustedOrigin(request);
    if (originError) {
      return originError;
    }

    const supabase = await createClient();
    const adminUser = await getAuthenticatedAdminUser(supabase);
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rateLimitError = await enforceUserRateLimit(supabase, {
      bucket: "admin:reset-usage",
      limit: 6,
      windowSeconds: 300,
      message: "Too many admin reset attempts. Please try again later.",
    });
    if (rateLimitError) {
      return rateLimitError;
    }

    const { error } = await supabase
      .from("users")
      .update({ jobs_this_month: 0 })
      .eq("id", adminUser.id);

    if (error) {
      console.error("Error resetting usage:", error);
      return NextResponse.json({ error: "Failed to reset usage" }, { status: 500 });
    }

    return NextResponse.json({ success: true, jobsThisMonth: 0 });
  } catch (error) {
    console.error("Error resetting usage:", error);
    return NextResponse.json(
      { error: "Failed to reset usage" },
      { status: 500 }
    );
  }
}
