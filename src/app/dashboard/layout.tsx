import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Dashboard",
  description: "Your RepurposeAI dashboard and recent content jobs.",
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
