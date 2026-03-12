"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Zap, Layers, Clock, Check, ArrowRight, Copy, CheckCircle } from "lucide-react";
import { siteConfig } from "@/lib/seo";

const SAMPLE_BLOG = `Why Most SaaS Businesses Fail in Their First Year

Starting a SaaS business seems straightforward: build a product, find customers, and scale. But the reality is far more complex. After analyzing hundreds of failed startups, I've identified three critical mistakes that kill most SaaS businesses before they even get started.

First, founders build solutions looking for problems. They fall in love with their technology instead of understanding customer pain points. The best SaaS companies start with deep customer research, not a brilliant idea.

Second, pricing is an afterthought. Many founders price too low, thinking it will attract more customers. In reality, low prices signal low value and attract price-sensitive customers who churn quickly.

Third, they ignore distribution. Having a great product means nothing if nobody knows about it. The most successful SaaS founders spend 50% of their time on marketing and sales, not product development.

The solution? Validate before you build. Talk to 50 potential customers before writing a single line of code. Price based on value, not cost. And start building your audience from day one.`;

const SAMPLE_OUTPUTS = {
  twitter: `1/ Why do 90% of SaaS businesses fail in year one?

After studying hundreds of failed startups, I found 3 critical mistakes.

Here's what kills most SaaS founders (and how to avoid it) 🧵

2/ Mistake #1: Building solutions looking for problems

Founders fall in love with their tech instead of customer pain points.

Fix: Start with deep customer research, not a "brilliant idea"

3/ Mistake #2: Pricing as an afterthought

Low prices ≠ more customers

Low prices = low perceived value + high churn

Fix: Price based on VALUE, not cost

4/ Mistake #3: Ignoring distribution

A great product nobody knows about is a failed product.

Top SaaS founders spend 50% of time on marketing & sales.

5/ The playbook that works:

• Validate before building
• Talk to 50 customers before coding
• Build your audience from day one
• Price for value

Which mistake have you seen most often? 👇`,

  linkedin: `I've analyzed hundreds of failed SaaS startups.

The patterns are surprisingly consistent.

Here are the 3 mistakes that kill most SaaS businesses in year one:

𝗠𝗶𝘀𝘁𝗮𝗸𝗲 #𝟭: Building solutions looking for problems

Founders fall in love with technology.
They should fall in love with customer pain points.

𝗠𝗶𝘀𝘁𝗮𝗸𝗲 #𝟮: Pricing as an afterthought

Low prices don't attract more customers.
They signal low value and attract high-churn users.

𝗠𝗶𝘀𝘁𝗮𝗸𝗲 #𝟯: Ignoring distribution

A great product nobody knows about is worthless.
The best founders spend 50% of time on marketing.

The fix is simple (but not easy):

→ Talk to 50 customers before writing code
→ Price based on value, not cost
→ Build your audience from day one

What's the biggest mistake you've seen SaaS founders make?

#SaaS #Startups #Entrepreneurship #ProductDevelopment`,

  instagram: `🚀 Why do 90% of SaaS businesses FAIL?

After studying hundreds of startups, here's what I found:

❌ Mistake 1: Building cool tech instead of solving real problems

❌ Mistake 2: Pricing too low (low price = low value perception)

❌ Mistake 3: Ignoring marketing until it's too late

✅ The Fix:
• Talk to 50 customers BEFORE building
• Price based on value
• Start marketing from day one

Save this for when you're ready to launch! 💡

Tag a founder who needs to see this 👇

#saas #startup #entrepreneur #founder #business #tech #marketing #productdevelopment #startuplife #entrepreneurship #businesstips #saasfounder #techstartup #growth`,
};

const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan with 3 AI repurposing jobs each month.",
    },
  },
];

export default function Home() {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState({
    twitter: true,
    linkedin: true,
    instagram: true,
  });
  const [showDemo, setShowDemo] = useState(false);

  const handleCopy = async (text: string, format: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTryDemo = () => {
    setShowDemo(true);
    setTimeout(() => {
      document.getElementById("demo-outputs")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="premium-container">
          <div className="flex items-center justify-between gap-3 sm:gap-4 h-20">
            <div className="flex min-w-0 items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight hidden sm:block">
                Repurpose<span className="text-white">AI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <Link href="/login">
                <Button variant="ghost" className="px-3 text-sm font-medium hover:bg-white/5 sm:px-4">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 px-4 sm:px-6 font-semibold shadow-lg shadow-indigo-600/20 rounded-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      <main>
      <section className="pt-24 pb-10 relative lg:pt-32 lg:pb-16">
        <div className="premium-container">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge variant="outline" className="mb-6 px-4 py-1 border-indigo-500/20 bg-indigo-500/5 text-indigo-300 backdrop-blur-sm rounded-full font-medium tracking-wide">
              ✨ 2.0 NEXT-GEN AI UPDATE
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Turn One Blog Post Into{" "}
              <br />
              <span className="gradient-text">10 Platform-Ready Posts</span>{" "}
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              RepurposeAI is an AI content repurposing tool that transforms one blog post, article,
              or newsletter into platform-ready social media posts for X, LinkedIn, Instagram, email,
              and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-black hover:bg-slate-200 text-lg px-10 h-14 font-bold rounded-2xl shadow-xl transition-all hover:scale-105">
                  Try it Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-10 h-14 font-medium border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-2xl" onClick={() => {
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Live Preview
              </Button>
            </div>
            <p className="text-sm text-muted-foreground/60 mt-6 flex items-center justify-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-500" /> No credit card required • 3 free jobs/month
            </p>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative px-4">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 rounded-[2.5rem] blur-3xl -z-10" />
            <Card className="relative glass-card border-white/10 overflow-hidden rounded-[2.5rem]">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 h-full min-h-[400px]">
                  <div className="lg:col-span-3 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-white/5">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest ml-2">Source: Blog Post</span>
                    </div>
                    <div className="space-y-4">
                      <div className="h-6 w-3/4 bg-white/10 rounded-full animate-pulse" />
                      <div className="h-4 w-full bg-white/5 rounded-full" />
                      <div className="h-4 w-11/12 bg-white/5 rounded-full" />
                      <div className="h-4 w-full bg-white/5 rounded-full" />
                      <div className="h-4 w-4/5 bg-white/5 rounded-full" />
                      <div className="pt-4 space-y-4">
                        <div className="h-4 w-full bg-white/5 rounded-full" />
                        <div className="h-4 w-11/12 bg-white/5 rounded-full" />
                        <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2 p-8 sm:p-12 bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest">Repurposing Outputs</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Twitter Thread", delay: "delay-100", icon: "🐦" },
                        { label: "LinkedIn Post", delay: "delay-200", icon: "💼" },
                        { label: "Instagram Caption", delay: "delay-300", icon: "📸" },
                        { label: "Email Newsletter", delay: "delay-400", icon: "📧" },
                        { label: "TikTok Script", delay: "delay-500", icon: "🎵" },
                      ].map((format) => (
                        <div key={format.label}
                          className={`flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/5 group`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{format.icon}</span>
                            <span className="text-sm font-medium tracking-wide">{format.label}</span>
                          </div>
                          <CheckCircle className="w-5 h-5 text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="py-12 lg:py-20 relative overflow-hidden bg-dot-pattern">
        <div className="premium-container">
          <div className="text-center mb-24">
            <Badge variant="outline" className="mb-4 border-indigo-500/30 text-indigo-400 rounded-full">Capabilities</Badge>
            <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight">
              AI content repurposing for <span className="gradient-text">every major channel.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Create social posts, email copy, and campaign assets from a single source article instead
              of rewriting every variation by hand.
            </p>
          </div>

          <div className="bento-grid">
            {/* Feature 1: Main Platform */}
            <div className="col-span-12 lg:col-span-7 bento-item border-beam">
              <div className="p-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20">
                  <Layers className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">12+ Smart Formats</h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  From deep-dive Twitter threads to professional LinkedIn insights. We support every major channel where your audience lives.
                </p>
                <div className="mt-10 grid grid-cols-3 gap-4">
                  {['X/Twitter', 'LinkedIn', 'YouTube', 'TikTok', 'Instagram', 'Email'].map(p => (
                    <div key={p} className="bg-white/5 rounded-xl p-3 text-center text-xs font-bold text-slate-400 transition-colors hover:bg-indigo-500/20 hover:text-indigo-300">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 2: Speed */}
            <div className="col-span-12 lg:col-span-5 bento-item">
              <div className="p-10 flex flex-col h-full bg-gradient-to-br from-indigo-900/10 to-transparent">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                  <Zap className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Flash Fast</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Turn a 2,000-word essay into a social media campaign in effectively 0.4 seconds.
                </p>
                <div className="mt-auto pt-10">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full gradient-bg-emerald animate-pulse" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Automation */}
            <div className="col-span-12 lg:col-span-4 bento-item">
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Automated Hooks</h4>
                <p className="text-sm text-muted-foreground">Every post generated with high-retention hooks proven to drive clicks.</p>
              </div>
            </div>

            {/* Feature 4: Brand Voice */}
            <div className="col-span-12 lg:col-span-4 bento-item">
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20">
                  <Check className="w-6 h-6 text-violet-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">Voice Sync</h4>
                <p className="text-sm text-muted-foreground">AI learns your brand tone to ensure consistency across every platform.</p>
              </div>
            </div>

            {/* Feature 5: Bulk Archive */}
            <div className="col-span-12 lg:col-span-4 bento-item">
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
                  <Copy className="w-6 h-6 text-rose-400" />
                </div>
                <h4 className="text-xl font-bold mb-2">One-Click ZIP</h4>
                <p className="text-sm text-muted-foreground">Export your entire campaign instantly for easy scheduling and archiving.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-12 lg:py-20 relative">
        <div className="premium-container max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-400 font-bold tracking-wider">Interactive Demo</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              See the Transformation
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Test drive the AI with a sample blog post. No signup required for this preview.
            </p>
          </div>

          <Card className="glass-card border-white/10 p-2 sm:p-4 rounded-[2rem]">
            <CardContent className="p-6 sm:p-10 space-y-10">
              <div className="space-y-4">
                <label className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-widest ml-1">Input Content</label>
                <Textarea
                  value={SAMPLE_BLOG}
                  readOnly
                  className="min-h-[220px] resize-none bg-white/[0.03] border-white/5 rounded-2xl p-6 text-base leading-relaxed focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div className="space-y-6">
                <label className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-widest ml-1">Select Destinations</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { id: "twitter", label: "Twitter Thread", icon: "🐦" },
                    { id: "linkedin", label: "LinkedIn Post", icon: "💼" },
                    { id: "instagram", label: "Instagram Caption", icon: "📸" },
                  ].map((format) => (
                    <label
                      key={format.id}
                      className={`flex items-center gap-3 px-5 py-3 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedFormats[format.id as keyof typeof selectedFormats]
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100 shadow-lg shadow-indigo-500/10'
                        : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10'
                        }`}
                    >
                      <Checkbox
                        checked={selectedFormats[format.id as keyof typeof selectedFormats]}
                        onCheckedChange={(checked) =>
                          setSelectedFormats((prev) => ({
                            ...prev,
                            [format.id]: checked,
                          }))
                        }
                        className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                      />
                      <span className="text-xl">{format.icon}</span>
                      <span className="font-medium tracking-wide">{format.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-500 w-full sm:w-auto px-10 h-14 font-bold text-lg border-0 shadow-lg shadow-indigo-600/20 rounded-2xl"
                onClick={handleTryDemo}
              >
                <Zap className="mr-2 h-5 w-5 fill-white" />
                Repurpose Now
              </Button>
            </CardContent>
          </Card>

          {/* Demo Outputs */}
          {showDemo && (
            <div id="demo-outputs" className="mt-16 grid md:grid-cols-3 gap-8">
              {Object.entries(selectedFormats).map(([key, isSelected]) => {
                if (!isSelected) return null;
                const formatInfo = {
                  twitter: { label: "Twitter Thread", icon: "🐦" },
                  linkedin: { label: "LinkedIn Post", icon: "💼" },
                  instagram: { label: "Instagram Caption", icon: "📸" },
                }[key as keyof typeof selectedFormats];

                return (
                  <Card key={key} className="glass-card border-indigo-500/20 rounded-3xl overflow-hidden group">
                    <CardHeader className="pb-4 bg-white/5 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{formatInfo?.icon}</span>
                          <CardTitle className="text-base font-bold tracking-wide uppercase text-indigo-100">{formatInfo?.label}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full hover:bg-indigo-500/20"
                          onClick={() => handleCopy(SAMPLE_OUTPUTS[key as keyof typeof SAMPLE_OUTPUTS], key)}
                        >
                          {copied === key ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <Copy className="h-5 w-5 text-muted-foreground group-hover:text-indigo-300 transition-colors" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                    <div className="bg-black/20 rounded-2xl p-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                        <p className="wrap-anywhere text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{SAMPLE_OUTPUTS[key as keyof typeof SAMPLE_OUTPUTS]}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {showDemo && (
            <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <p className="text-lg text-muted-foreground mb-6">
                Ready to transform your own content?
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 px-12 h-14 font-bold text-lg border-0 shadow-lg shadow-indigo-600/20 rounded-2xl text-white">
                  Join for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="pricing" className="py-12 lg:py-20 relative">
        <div className="premium-container">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400 font-bold tracking-wider">Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              Ready to Level Up?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent pricing for creators of all sizes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="glass-card border-white/5 p-8 rounded-[2.5rem] flex flex-col h-full min-h-[600px]">
              <CardHeader className="pt-4 text-center p-0 mb-12">
                <CardTitle className="text-2xl font-bold text-purple-200">Free Forever</CardTitle>
                <div className="mt-6">
                  <span className="text-6xl font-extrabold">$0</span>
                  <span className="text-muted-foreground ml-2 text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-0 flex-1 flex flex-col justify-between">
                <ul className="space-y-8 mb-8">
                  {[
                    "3 AI repurposing jobs per month",
                    "5 basic platform formats",
                    "Unlimited copy to clipboard",
                    "Historical job viewing",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                        <Check className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold" size="lg">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Tier - Coming Soon */}
            <Card className="glass-card border-indigo-500/30 relative shadow-2xl shadow-indigo-900/10 p-8 rounded-[2.5rem] flex flex-col h-full min-h-[600px] opacity-75 grayscale-[0.3]">
              <CardHeader className="pt-4 text-center p-0 mb-12">
                <CardTitle className="text-2xl font-bold text-white">Pro Creator</CardTitle>
                <div className="mt-6">
                  <span className="text-6xl font-extrabold">$19</span>
                  <span className="text-muted-foreground ml-2 text-lg">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-0 flex-1 flex flex-col justify-between">
                <ul className="space-y-5 mb-8">
                  {[
                    "Unlimited AI repurposing jobs",
                    "All 10+ platform formats",
                    "Advanced brand voice selection",
                    "Bulk download as ZIP",
                    "Priority server processing",
                    "Early access to new features",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-wide">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full h-14 rounded-2xl bg-white/10 text-white font-black text-lg border-0 cursor-not-allowed" size="lg" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 relative bg-black/40">
        <div className="premium-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight">Repurpose<span className="text-white">AI</span></span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Pricing
              </a>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Login
              </Link>
              <a href="mailto:support@repurpose.ai" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground/60 tracking-wider">
            © {new Date().getFullYear()} REPURPOSE AI. CRAFTED FOR CREATORS.
          </div>
        </div>
      </footer>
    </div>
  );
}
