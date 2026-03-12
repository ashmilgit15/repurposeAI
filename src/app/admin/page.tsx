import { notFound } from "next/navigation";

import { AdminClient } from "./admin-client";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedAdminUser } from "@/lib/security/admin";

async function getAdminStatus(adminUserId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("email, subscription_tier, jobs_this_month")
    .eq("id", adminUserId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    email: data.email,
    tier: data.subscription_tier,
    jobsThisMonth: data.jobs_this_month,
  };
}

export default async function AdminPage() {
  const supabase = await createClient();
  const adminUser = await getAuthenticatedAdminUser(supabase);

  if (!adminUser) {
    notFound();
  }

  const initialStatus = await getAdminStatus(adminUser.id);

  return <AdminClient initialStatus={initialStatus} />;
}
