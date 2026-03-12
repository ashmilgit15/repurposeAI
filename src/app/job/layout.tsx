import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Job",
  description: "Private RepurposeAI job results.",
});

export default function JobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
