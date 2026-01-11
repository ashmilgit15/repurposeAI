"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  ArrowLeft,
  Copy,
  CheckCircle,
  Download,
  Plus,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { PLATFORM_INFO, type Job, type Platform } from "@/lib/types";

interface JobResultsClientProps {
  job: Job;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function JobResultsClient({ job }: JobResultsClientProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = useCallback(async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, []);

  const handleDownloadAll = useCallback(async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      Object.entries(job.outputs).forEach(([format, content]) => {
        const info = PLATFORM_INFO[format as Platform];
        const fileName = `${info?.label || format}.txt`;
        zip.file(fileName, content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `repurpose-ai-${job.id.substring(0, 8)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Downloaded all outputs as ZIP");
    } catch {
      toast.error("Failed to create ZIP file");
    } finally {
      setDownloading(false);
    }
  }, [job.outputs, job.id]);

  return (
    <div className="min-h-screen relative">

      {/* Header */}
      <header className="glass-nav">
        <div className="premium-container">
          <div className="flex items-center h-16 gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-white/5 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Dashboard
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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <Badge variant="outline" className="mb-4 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 rounded-full font-bold tracking-wider">SUCCESS</Badge>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3">Delivery Ready</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Campaign generated on {formatDate(job.created_at)}
            </p>
          </div>
          <Button
            onClick={handleDownloadAll}
            disabled={downloading}
            className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xl shadow-indigo-600/20"
          >
            <Download className={`w-5 h-5 mr-3 ${downloading ? 'animate-bounce' : ''}`} />
            {downloading ? "Archiving..." : "Download Batch"}
          </Button>
        </div>

        {/* Original Content Preview */}
        <Card className="mb-12 glass-card border-white/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 px-8 py-6">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Source Content Digest</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
              <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
                "{job.input_text.substring(0, 400)}
                {job.input_text.length > 400 ? "..." : ""}"
              </p>
            </div>
            <div className="mt-6 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest px-1">
              <div className="flex items-center gap-2 text-indigo-400">
                <Zap className="w-3 h-3" />
                <span>Context: {job.brand_voice}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <CheckCircle className="w-3 h-3" />
                <span>{Object.keys(job.outputs).length} Formats</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="mb-8" />

        {/* Generated Outputs */}
        <div className="grid gap-8">
          {Object.entries(job.outputs).map(([format, content]) => {
            const info = PLATFORM_INFO[format as Platform];
            if (!info) return null;

            return (
              <Card key={format} className="glass-card rounded-[2.5rem] overflow-hidden group transition-all duration-500 border-white/5 hover:border-indigo-500/30">
                <CardHeader className="bg-white/5 border-b border-white/5 px-8 h-20 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{info.icon}</span>
                    <CardTitle className="text-lg font-bold tracking-tight">{info.label}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(content, format)}
                    className="rounded-xl h-10 px-4 hover:bg-white/5 text-indigo-300 font-bold"
                  >
                    {copiedFormat === format ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Snapped!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/5 min-h-[120px] max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 group-hover:border-indigo-500/10 transition-colors">
                    <p className="text-sm leading-relaxed text-muted-foreground/90 whitespace-pre-wrap">{content}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/new-job" className="w-full sm:w-auto">
            <Button className="w-full h-14 px-10 rounded-2xl font-black text-lg bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-xl shadow-indigo-600/30" size="lg">
              <Plus className="w-5 h-5 mr-3" />
              New Job
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full h-14 px-10 rounded-2xl hover:bg-white/5 font-bold">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
