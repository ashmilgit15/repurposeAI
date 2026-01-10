import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_SECRET = "repurpose2024";

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Invalid admin secret" }, { status: 403 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("users")
      .update({ jobs_this_month: 0 })
      .eq("id", user.id);

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
