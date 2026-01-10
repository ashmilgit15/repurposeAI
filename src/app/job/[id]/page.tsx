import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobResultsClient } from "./job-results-client";
import type { Job } from "@/lib/types";

async function getJob(jobId: string, userId: string): Promise<Job | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const job = await getJob(id, authUser.id);

  if (!job) {
    notFound();
  }

  return <JobResultsClient job={job} />;
}
