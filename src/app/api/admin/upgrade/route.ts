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
      .update({ subscription_tier: "pro" })
      .eq("id", user.id);

    if (error) {
      console.error("Error upgrading user:", error);
      return NextResponse.json({ error: "Failed to upgrade" }, { status: 500 });
    }

    return NextResponse.json({ success: true, tier: "pro" });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return NextResponse.json(
      { error: "Failed to upgrade" },
      { status: 500 }
    );
  }
}
