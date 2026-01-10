"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Zap, ArrowLeft, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const ADMIN_SECRET = "repurpose2024"; // Change this to your own secret

export default function AdminPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<{
    email: string;
    tier: string;
    jobsThisMonth: number;
  } | null>(null);

  const handleAuth = () => {
    if (secret === ADMIN_SECRET) {
      setIsAuthenticated(true);
      toast.success("Admin access granted");
      fetchUserStatus();
    } else {
      toast.error("Invalid admin secret");
    }
  };

  const fetchUserStatus = async () => {
    try {
      const response = await fetch("/api/admin/status");
      if (response.ok) {
        const data = await response.json();
        setUserStatus(data);
      }
    } catch {
      toast.error("Failed to fetch user status");
    }
  };

  const handleUpgradeToPro = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: ADMIN_SECRET }),
      });

      if (response.ok) {
        toast.success("Upgraded to Pro! You now have unlimited access.");
        fetchUserStatus();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to upgrade");
      }
    } catch {
      toast.error("Failed to upgrade");
    } finally {
      setLoading(false);
    }
  };

  const handleResetUsage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reset-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: ADMIN_SECRET }),
      });

      if (response.ok) {
        toast.success("Usage reset to 0!");
        fetchUserStatus();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to reset usage");
      }
    } catch {
      toast.error("Failed to reset usage");
    } finally {
      setLoading(false);
    }
  };

  const handleDowngradeToFree = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: ADMIN_SECRET }),
      });

      if (response.ok) {
        toast.success("Downgraded to Free tier");
        fetchUserStatus();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to downgrade");
      }
    } catch {
      toast.error("Failed to downgrade");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter the admin secret to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="secret">Admin Secret</Label>
              <Input
                id="secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Enter admin secret..."
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              />
            </div>
            <Button onClick={handleAuth} className="w-full gradient-bg">
              Access Admin Panel
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {/* Current Status */}
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
                <p className="text-muted-foreground">Loading status...</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account for testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleUpgradeToPro}
                  disabled={loading || userStatus?.tier === "pro"}
                  className="gradient-bg hover:opacity-90 h-auto py-4 flex-col"
                >
                  <Zap className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Upgrade to Pro</span>
                  <span className="text-xs opacity-80">Unlimited jobs & all formats</span>
                </Button>

                <Button
                  onClick={handleResetUsage}
                  disabled={loading}
                  variant="outline"
                  className="h-auto py-4 flex-col"
                >
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span className="font-semibold">Reset Usage</span>
                  <span className="text-xs text-muted-foreground">Set jobs this month to 0</span>
                </Button>

                <Button
                  onClick={handleDowngradeToFree}
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

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm">
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Upgrade to Pro:</strong> Click the button above to get unlimited jobs and access to all 10 output formats.</li>
                <li><strong>Reset Usage:</strong> If you want to test the free tier limits, downgrade to free and reset your usage to 0.</li>
                <li><strong>Test Formats:</strong> Pro tier gives you access to YouTube, TikTok, Facebook, Pinterest, and Reddit formats.</li>
                <li><strong>No character limit:</strong> Content length is now unlimited - scrape any size article!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
