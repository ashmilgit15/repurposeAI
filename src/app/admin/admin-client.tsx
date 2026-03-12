"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Zap, ArrowLeft, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AdminStatus {
  email: string;
  tier: string;
  jobsThisMonth: number;
}

interface AdminClientProps {
  initialStatus: AdminStatus | null;
}

export function AdminClient({ initialStatus }: AdminClientProps) {
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<AdminStatus | null>(initialStatus);

  const fetchUserStatus = async () => {
    try {
      const response = await fetch("/api/admin/status");
      if (response.ok) {
        const data = await response.json();
        setUserStatus(data);
      } else if (response.status === 403) {
        toast.error("Admin access is not configured for this account.");
      } else {
        toast.error("Failed to fetch user status");
      }
    } catch {
      toast.error("Failed to fetch user status");
    }
  };

  const runAdminAction = async (endpoint: string, successMessage: string) => {
    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error || "Admin action failed");
        return;
      }

      toast.success(successMessage);
      await fetchUserStatus();
    } catch {
      toast.error("Admin action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Account Status</CardTitle>
              <CardDescription>Your current subscription and usage</CardDescription>
            </CardHeader>
            <CardContent>
              {userStatus ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Email</span>
                    <span className="text-sm">{userStatus.email}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Subscription Tier</span>
                    <span className={`text-sm font-bold ${userStatus.tier === "pro" ? "text-green-600" : "text-orange-600"}`}>
                      {userStatus.tier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Jobs This Month</span>
                    <span className="text-sm">{userStatus.jobsThisMonth} / {userStatus.tier === "pro" ? "∞" : "3"}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchUserStatus}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Unable to load admin status.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account for testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => runAdminAction("/api/admin/upgrade", "Upgraded to Pro.")}
                  disabled={loading || userStatus?.tier === "pro"}
                  className="gradient-bg hover:opacity-90 h-auto py-4 flex-col"
                >
                  <Zap className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Upgrade to Pro</span>
                  <span className="text-xs opacity-80">Unlimited jobs & all formats</span>
                </Button>

                <Button
                  onClick={() => runAdminAction("/api/admin/reset-usage", "Usage reset to 0.")}
                  disabled={loading}
                  variant="outline"
                  className="h-auto py-4 flex-col"
                >
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Reset Usage</span>
                  <span className="text-xs text-muted-foreground">Set jobs this month to 0</span>
                </Button>

                <Button
                  onClick={() => runAdminAction("/api/admin/downgrade", "Downgraded to Free tier.")}
                  disabled={loading || userStatus?.tier === "free"}
                  variant="outline"
                  className="h-auto py-4 flex-col border-orange-200 hover:bg-orange-50"
                >
                  <XCircle className="w-6 h-6 mb-2 text-orange-600" />
                  <span className="font-semibold">Downgrade to Free</span>
                  <span className="text-xs text-muted-foreground">Test free tier limits</span>
                </Button>

                <Link href="/new-job" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex-col border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="w-6 h-6 mb-2 text-green-600" />
                    <span className="font-semibold">Create New Job</span>
                    <span className="text-xs text-muted-foreground">Test content generation</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm">
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>Admin access now requires a server-side allowlist via <code>ADMIN_USER_IDS</code> or <code>ADMIN_USER_EMAILS</code>.</li>
                <li>Only authenticated users on that allowlist can access this page or invoke the admin APIs.</li>
                <li>State-changing admin actions also require a same-origin browser request.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
