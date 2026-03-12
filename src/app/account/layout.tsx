import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Account",
  description: "Manage your RepurposeAI account settings and billing.",
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
