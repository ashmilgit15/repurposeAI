"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Zap,
  ArrowLeft,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PLATFORM_INFO, type Platform } from "@/lib/types";
import { toast } from "sonner";

const ALL_PLATFORMS: Platform[] = [
  "twitter",
  "linkedin",
  "instagram",
  "email",
  "youtube",
  "tiktok",
  "facebook",
  "pinterest",
  "blog_summary",
  "reddit",
];

interface NewJobClientProps {
  canCreateJob: boolean;
  isProUser: boolean;
  jobsRemaining: number;
}

export function NewJobClient({ canCreateJob, isProUser, jobsRemaining }: NewJobClientProps) {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<Platform[]>(["twitter", "linkedin", "instagram"]);
  const [brandVoice, setBrandVoice] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(!canCreateJob);
  const [scrapedTitle, setScrapedTitle] = useState<string | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const charCount = useMemo(() => inputText.length, [inputText]);
  const isValidInput = useMemo(() => charCount >= 100, [charCount]);
  const hasSelectedFormats = useMemo(() => selectedFormats.length > 0, [selectedFormats]);
  const canSubmit = useMemo(
    () => isValidInput && hasSelectedFormats && !loading && !scraping,
    [isValidInput, hasSelectedFormats, loading, scraping]
  );

  const handleFormatToggle = useCallback((format: Platform) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  }, []);

  const handleScrapeUrl = useCallback(async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com/article)");
      return;
    }

    setScraping(true);
    setScrapedTitle(null);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scrape URL");
      }

      setInputText(data.content || "");
      setScrapedTitle(data.title);
      toast.success(`Content extracted from: ${data.title || urlInput}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to scrape URL");
    } finally {
      setScraping(false);
    }
  }, [urlInput]);

  const handleSubmit = useCallback(async () => {
    console.log("Generate Content button clicked");

    // Validation checks with user feedback
    if (!inputText) {
      toast.error("Please enter some content to repurpose");
      return;
    }

    if (inputText.length < 100) {
      toast.error(`Content is too short (${inputText.length}/100 chars). Please add more detail.`);
      return;
    }

    if (selectedFormats.length === 0) {
      toast.error("Please select at least one platform format");
      return;
    }

    if (loading || scraping) return;

    setLoading(true);
    setProgress(0);
    const startTime = Date.now();

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      console.log("Sending request to /api/jobs/create...");
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: inputText,
          selected_formats: selectedFormats,
          brand_voice: brandVoice,
        }),
      });

      clearInterval(progressInterval);

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        let errorMessage = "Failed to create job";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          console.error("Non-JSON error response from server:", response.status, response.statusText);
          const textBody = await response.text();
          console.error("Response body:", textBody);
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Job created successfully:", data);

      setProgress(100);

      // Ensure loading state is visible for at least 800ms to prevent flashing
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsedTime);

      setTimeout(() => {
        router.push(`/job/${data.job_id}`);
      }, 500 + remainingTime);
    } catch (error) {
      console.error("Submit error:", error);
      clearInterval(progressInterval);
      toast.error(error instanceof Error ? error.message : "Failed to create job");
      setLoading(false);
      setProgress(0);
    }
  }, [inputText, selectedFormats, brandVoice, loading, scraping, router]);

  const toggleContentExpanded = useCallback(() => {
    setIsContentExpanded((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen relative">

      {/* Header */}
      <header className="glass-nav">
        <div className="premium-container">
          <div className="flex items-center h-16 gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-white/5 group text-slate-400">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Repurpose<span className="text-white">AI</span></span>
            </div>
          </div>
        </div>
      </header>

      <main className="premium-container py-12 lg:py-20">
        <div className="mb-10">
          <Badge variant="outline" className="mb-4 border-indigo-500/20 bg-indigo-500/5 text-indigo-400 rounded-full py-1 px-4 font-bold tracking-wider">CREATOR STUDIO</Badge>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3">Forge Content</h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl">
            Input your source and let our AI engine generate platform-ready social sets.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="glass-card rounded-[2.5rem] overflow-hidden border-indigo-500/10 shadow-indigo-500/5">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white text-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  1
                </div>
                The Source Material
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <LinkIcon className="w-5 h-5 text-muted-foreground/50 group-focus-within:text-purple-400 transition-colors" />
                    </div>
                    <Input
                      type="url"
                      placeholder="Paste blog or article URL here..."
                      className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-indigo-500/50 transition-all text-base"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      disabled={scraping || loading}
                    />
                  </div>
                  <Button
                    onClick={handleScrapeUrl}
                    disabled={scraping || loading || !urlInput.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 h-14 px-8 rounded-2xl font-bold text-md border-0 shadow-lg shadow-emerald-600/10 text-white"
                  >
                    {scraping ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Extract
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <Label className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-widest">Input Text</Label>
                    <span className={`text-[10px] font-black tracking-widest uppercase ${charCount < 100 ? "text-orange-400" : "text-green-400/60"}`}>
                      {charCount.toLocaleString()} Characters {charCount < 100 && "(min 100)"}
                    </span>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className={`bg-white/[0.03] border-white/10 rounded-2xl p-6 text-base leading-relaxed focus:border-indigo-500/50 transition-all resize-none scrollbar-thin scrollbar-thumb-white/10 will-change-[height] ${
                        isContentExpanded ? "min-h-[300px]" : "min-h-[120px] max-h-[120px] overflow-hidden"
                      }`}
                      placeholder="Paste your text content here, or extract from a URL above..."
                      disabled={loading}
                    />
                    {inputText.length > 200 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleContentExpanded}
                        className="absolute bottom-2 left-2 h-8 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold backdrop-blur-sm"
                      >
                        {isContentExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            Show More
                          </>
                        )}
                      </Button>
                    )}
                    {scrapedTitle && (
                      <div className="absolute bottom-2 right-2 animate-in fade-in slide-in-from-right-4">
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-medium px-3 py-1.5 rounded-xl backdrop-blur-sm">
                          ✓ {scrapedTitle.substring(0, 30)}...
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-[2.5rem] overflow-hidden border-cyan-500/10 shadow-cyan-500/5">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white text-lg flex items-center justify-center shadow-lg shadow-cyan-600/20">
                  2
                </div>
                Target Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALL_PLATFORMS.map((platform) => {
                  const info = PLATFORM_INFO[platform];
                  const isSelected = selectedFormats.includes(platform);
                  const isBeta = info.beta;

                  return (
                    <label
                      key={platform}
                      className={`group relative flex items-start gap-4 p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 ${isSelected
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]"
                        }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleFormatToggle(platform)}
                        disabled={loading}
                        className="mt-1 border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{info.icon}</span>
                            <span className="font-bold text-sm tracking-wide">{info.label}</span>
                          </div>
                          {isBeta && (
                            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] h-4 px-1.5 uppercase font-black tracking-widest">Beta</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground/70 leading-normal line-clamp-2">
                          {info.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-[2.5rem] overflow-hidden border-rose-500/10 shadow-rose-500/5">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white text-lg flex items-center justify-center shadow-lg shadow-rose-500/20">
                  3
                </div>
                Strategic Voice
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Select value={brandVoice} onValueChange={setBrandVoice} disabled={loading}>
                <SelectTrigger className="w-full sm:w-80 h-14 rounded-2xl bg-white/5 border-white/10 text-base font-medium px-6 focus:ring-rose-500/20">
                  <SelectValue placeholder="How should we sound?" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10 rounded-2xl p-2">
                  {[
                    { val: "professional", label: "Professional", icon: "👔" },
                    { val: "casual", label: "Casual", icon: "☕" },
                    { val: "friendly", label: "Friendly", icon: "😊" },
                    { val: "authoritative", label: "Authoritative", icon: "⚖️" },
                    { val: "witty", label: "Witty", icon: "⚡" },
                  ].map((voice) => (
                    <SelectItem key={voice.val} value={voice.val} className="rounded-xl py-3 px-4 hover:bg-white/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{voice.icon}</span>
                        <span className="font-medium">{voice.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 glass-card border-indigo-500/20 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border-beam">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Production Status</p>
              <div className="text-sm font-bold text-white/80 flex items-center gap-2">
                {isProUser ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400">Unlimited Usage Active</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span>{jobsRemaining} productions available</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Link href="/dashboard" className="flex-1 sm:flex-none">
                <Button variant="ghost" className="w-full h-14 rounded-2xl hover:bg-white/5 font-bold" disabled={loading}>
                  Archive Draft
                </Button>
              </Link>
              <Button
                type="button"
                className="flex-1 sm:flex-none h-14 px-12 rounded-2xl font-black text-lg bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-xl shadow-indigo-600/30 group disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading || scraping}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-md glass-card border-indigo-500/30 rounded-[3rem] shadow-[0_0_100px_-20px_rgba(99,102,241,0.3)]">
            <CardContent className="p-12 text-center">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-4 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                  <Zap className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">AI is Crafting...</h3>
              <p className="text-muted-foreground font-medium mb-10 leading-relaxed px-2 text-sm italic">
                We're optimizing your content for {selectedFormats.length} different platforms. Hang tight!
              </p>

              <div className="space-y-3">
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full gradient-bg transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{Math.round(progress)}% Optimized</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-purple-500 animate-bounce" />
                    <div className="w-1 h-1 rounded-full bg-purple-500 animate-bounce delay-100" />
                    <div className="w-1 h-1 rounded-full bg-purple-500 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="glass-card border-purple-500/30 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="p-10 text-center">
            <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-600/40">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl font-black tracking-tight text-center">Out of Credits!</DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground font-medium text-center pt-2">
                You've used all 3 free jobs this month. Unlock unlimited production with Pro.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Link href="/account">
                <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg border-0 shadow-xl shadow-indigo-600/30">
                  Go Pro - $19/month
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full h-14 rounded-2xl hover:bg-white/5 font-bold">
                  Maybe Later
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
