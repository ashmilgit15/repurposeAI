import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedAdminUser } from "@/lib/security/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const adminUser = await getAuthenticatedAdminUser(supabase);
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select("email, subscription_tier, jobs_this_month")
      .eq("id", adminUser.id)
      .single();

    if (error || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: userData.email,
      tier: userData.subscription_tier,
      jobsThisMonth: userData.jobs_this_month,
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
