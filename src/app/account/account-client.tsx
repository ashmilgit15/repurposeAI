"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Zap,
  ArrowLeft,
  LogOut,
  Calendar,
  CreditCard,
  Sparkles,
  Loader2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/lib/types";
import { FREE_TIER_LIMIT } from "@/lib/types";

interface AccountClientProps {
  user: User;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AccountClient({ user }: AccountClientProps) {
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const usagePercentage =
    user.subscription_tier === "pro"
      ? 0
      : (user.jobs_this_month / FREE_TIER_LIMIT) * 100;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to start checkout. Please try again.");
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    setUpgrading(true);
    try {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to open billing portal. Please try again.");
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success("Subscription cancelled. You'll retain access until the end of your billing period.");
      setShowCancelDialog(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">RepurposeAI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{formatDate(user.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Subscription
                {user.subscription_tier === "pro" && (
                  <Badge className="gradient-bg">Pro</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user.subscription_tier === "free" ? (
                <>
                  {/* Free Tier */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current Plan</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Jobs this month</span>
                        <span className="font-medium">
                          {user.jobs_this_month} / {FREE_TIER_LIMIT}
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Resets on: {formatDate(user.jobs_reset_date)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Upgrade CTA */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-2">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get unlimited jobs and access to all 10 output formats.
                    </p>
                    <ul className="space-y-2 mb-6">
                      {[
                        "Unlimited repurpose jobs",
                        "All 10 output formats",
                        "Custom brand voice",
                        "Priority processing",
                        "Download as ZIP",
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full gradient-bg hover:opacity-90"
                      size="lg"
                      onClick={handleUpgrade}
                      disabled={upgrading}
                    >
                      {upgrading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Upgrade to Pro - $19/month
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Pro Tier */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Current Plan</span>
                      <span className="font-medium flex items-center gap-2">
                        Pro <Sparkles className="w-4 h-4 text-yellow-500" />
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Jobs this month</span>
                      <span className="font-medium text-primary">Unlimited</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next billing</span>
                      <span className="font-medium">{formatDate(user.jobs_reset_date)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">$19.00</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleManageSubscription}
                      disabled={upgrading}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {upgrading ? "Loading..." : "Manage Subscription"}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Logout */}
          <Card>
            <CardContent className="pt-6">
              <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your Pro subscription? You&apos;ll lose access to:
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 py-4">
            {[
              "Unlimited repurpose jobs",
              "All 10 output formats",
              "Custom brand voice",
              "Priority processing",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                {feature}
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
