import type { Metadata } from "next";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Signup",
  description: "Create your RepurposeAI account.",
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
