import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Authentication",
  description: "Authentication and callback flows for RepurposeAI.",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
