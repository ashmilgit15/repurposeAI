import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "New Job",
  description: "Create a new RepurposeAI content repurposing job.",
});

export default function NewJobLayout({ children }: { children: React.ReactNode }) {
  return children;
}
