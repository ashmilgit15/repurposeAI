"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Plus,
  ArrowRight,
  Calendar,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User, Job } from "@/lib/types";
import { FREE_TIER_LIMIT } from "@/lib/types";

interface DashboardClientProps {
  user: User;
  recentJobs: Job[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

export function DashboardClient({ user, recentJobs }: DashboardClientProps) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  const usagePercentage = useMemo(
    () => (user.subscription_tier === "pro" ? 0 : (user.jobs_this_month / FREE_TIER_LIMIT) * 100),
    [user.subscription_tier, user.jobs_this_month]
  );

  const canCreateJob = useMemo(
    () => user.subscription_tier === "pro" || user.jobs_this_month < FREE_TIER_LIMIT,
    [user.subscription_tier, user.jobs_this_month]
  );

  return (
    <div className="min-h-screen relative">

      {/* Header */}
      <header className="glass-nav">
        <div className="premium-container">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Repurpose<span className="text-white">AI</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-2 py-1.5 h-auto hover:bg-white/5 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start gap-0.5">
                      <span className="text-sm font-semibold leading-none">{user.email.split('@')[0]}</span>
                      <Badge variant="outline" className="text-[10px] leading-none px-1 py-0 border-indigo-500/30 text-indigo-300 bg-indigo-500/5">
                        {user.subscription_tier.toUpperCase()}
                      </Badge>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass-card border-white/10 p-2">
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-destructive/10 text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="premium-container py-12 lg:py-20">
        {/* Welcome Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Badge variant="outline" className="mb-4 border-white/10 bg-white/5 text-slate-400 rounded-full font-bold tracking-wider">WORKSPACE</Badge>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">My Production</h1>
            <p className="text-muted-foreground font-medium text-lg">Manage and scale your content engine.</p>
          </div>
          <Link href="/new-job">
            <Button className="bg-white text-black hover:bg-slate-200 h-14 px-8 rounded-2xl font-bold shadow-xl transition-all hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              New Job
            </Button>
          </Link>
        </div>

        <div className="bento-grid">
          {/* Recent Jobs - Main Bento Tile */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black tracking-widest uppercase text-muted-foreground/60">Recent Creations</h2>
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-white/10 bg-white/5 rounded-full">{recentJobs.length} total</Badge>
            </div>

            {recentJobs.length === 0 ? (
              <Card className="glass-card border-white/5 rounded-[2.5rem] p-16 text-center animate-in fade-in slide-in-from-bottom-8">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
                  <Sparkles className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Your desk is empty</h3>
                <p className="text-muted-foreground mb-10 max-w-xs mx-auto">
                  Start repurposing your content today and see the magic happen.
                </p>
                <Link href="/new-job">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 font-bold rounded-xl shadow-lg shadow-indigo-600/20">
                    <Plus className="w-4 h-4 mr-2" />
                    New Job
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-8">
                {recentJobs.map((job) => (
                  <Link key={job.id} href={`/job/${job.id}`} className="group">
                    <div className="glass-card border-white/5 hover:border-indigo-500/30 rounded-[1.5rem] p-4 flex items-center justify-between gap-6 transition-all hover:bg-white/[0.05]">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                        <Calendar className="w-5 h-5 text-muted-foreground group-hover:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate mb-0.5 text-white/90">
                          {job.input_text.substring(0, 60)}...
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/80 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                            {job.selected_formats.length} Channels
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 font-medium">{getRelativeTime(job.created_at)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-indigo-400" />
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Area - Grouped in Bento Tiles */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Credits Tile */}
            <div className="glass-card border-beam rounded-[2.5rem] p-8 overflow-hidden animate-in fade-in slide-in-from-right-8 delay-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Subscription</h3>
                {user.subscription_tier === 'pro' && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-black px-2 py-0.5 rounded-full">Pro</Badge>
                )}
              </div>

              {user.subscription_tier === 'pro' ? (
                <div className="py-2">
                  <p className="text-4xl font-black mb-2">Unlimited</p>
                  <p className="text-xs text-muted-foreground font-medium">No production caps active.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black">{user.jobs_this_month} <span className="text-sm text-muted-foreground font-normal">/ {FREE_TIER_LIMIT} used</span></p>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Active</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-white/5">
                <Link href="/account">
                  <Button className="w-full bg-slate-800 text-slate-400 h-12 rounded-xl font-bold border border-white/5 cursor-not-allowed" disabled>
                    Free during Beta
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Tips Tile */}
            <div className="glass-card rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-right-8 delay-200">
              <div className="mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Expert Tips</h3>
              </div>
              <div className="space-y-6">
                {[
                  { icon: '🎯', text: 'Paste deep blog content for better AI context', color: 'indigo' },
                  { icon: '🚀', text: 'Select at least 3 formats to maximize reach', color: 'emerald' },
                  { icon: '📦', text: 'Bulk export as ZIP for easy scheduling', color: 'cyan' },
                ].map((tip, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg border border-white/5 transition-colors group-hover:border-white/20">
                      {tip.icon}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground/80 leading-relaxed pt-1 group-hover:text-white transition-colors">
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics Mini Tile */}
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-8 delay-300">
              <div className="glass-card rounded-[1.5rem] p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Refill Date</p>
                <p className="text-xs font-bold text-white/70">{formatDate(user.jobs_reset_date)}</p>
              </div>
              <div className="glass-card rounded-[1.5rem] p-5">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Tier</p>
                <p className="text-xs font-bold text-indigo-400 capitalize">{user.subscription_tier}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
