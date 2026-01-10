import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountClient } from "./account-client";
import type { User } from "@/lib/types";

async function getUserData(userId: string): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function AccountPage() {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const userData = await getUserData(authUser.id);

  const user: User = userData || {
    id: authUser.id,
    email: authUser.email || "",
    subscription_tier: "free",
    jobs_this_month: 0,
    jobs_reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toISOString(),
    stripe_customer_id: null,
    created_at: new Date().toISOString(),
  };

  return <AccountClient user={user} />;
}
