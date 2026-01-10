import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewJobClient } from "./new-job-client";
import { FREE_TIER_LIMIT } from "@/lib/types";

async function getUserData(userId: string) {
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

export default async function NewJobPage() {
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const userData = await getUserData(authUser.id);

  const isProUser = userData?.subscription_tier === "pro";
  const jobsThisMonth = userData?.jobs_this_month || 0;
  const canCreateJob = isProUser || jobsThisMonth < FREE_TIER_LIMIT;
  const jobsRemaining = isProUser ? Infinity : FREE_TIER_LIMIT - jobsThisMonth;

  return (
    <NewJobClient
      canCreateJob={canCreateJob}
      isProUser={isProUser}
      jobsRemaining={jobsRemaining}
    />
  );
}
