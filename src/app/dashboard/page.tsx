import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import type { User, Job } from "@/lib/types";

async function getUserData(userId: string): Promise<User | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  // Check if we need to reset the usage counter
  const now = new Date();
  const resetDate = new Date(data.jobs_reset_date);

  if (now >= resetDate) {
    const nextReset = new Date(now);
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);

    await supabase
      .from("users")
      .update({
        jobs_this_month: 0,
        jobs_reset_date: nextReset.toISOString(),
      })
      .eq("id", userId);

    return { ...data, jobs_this_month: 0, jobs_reset_date: nextReset.toISOString() };
  }

  return data;
}

async function getRecentJobs(userId: string): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return [];
  return data || [];
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const userData = await getUserData(authUser.id);
  const recentJobs = await getRecentJobs(authUser.id);

  // If no user data exists yet (new user), create default data
  const user: User = userData || {
    id: authUser.id,
    email: authUser.email || "",
    subscription_tier: "free",
    jobs_this_month: 0,
    jobs_reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toISOString(),
    stripe_customer_id: null,
    created_at: new Date().toISOString(),
  };

  return <DashboardClient user={user} recentJobs={recentJobs} />;
}
