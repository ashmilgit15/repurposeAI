import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepurposeAI - Turn One Blog Post Into 10 Platform-Ready Posts",
  description: "Stop spending hours repurposing content. Let AI transform your blog posts into Twitter threads, LinkedIn posts, Instagram captions, and more in 60 seconds.",
  keywords: ["content repurposing", "AI content", "social media automation", "content marketing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-indigo-500/30`}
      >
        <div className="mesh-gradient" />
        <div className="mesh-ball w-[500px] h-[500px] bg-indigo-600 top-[-100px] left-[-100px] animate-glow" />
        <div className="mesh-ball w-[400px] h-[400px] bg-cyan-600 bottom-[-50px] right-[-50px] animate-glow delay-1000" />
        {children}
        <Toaster position="bottom-right" theme="dark" closeButton />
      </body>
    </html>
  );
}
