import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Login",
  description: "Sign in to your RepurposeAI account.",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
