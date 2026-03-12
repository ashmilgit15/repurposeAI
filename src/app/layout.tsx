import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { absoluteUrl, defaultRobots, siteConfig } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-G11MTGFFNP";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.title}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "marketing",
  manifest: "/manifest.webmanifest",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl(siteConfig.socialImagePath),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} social preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.socialImagePath)],
  },
  robots: defaultRobots,
  icons: {
    icon: [
      { url: "/icon?size=32", sizes: "32x32", type: "image/png" },
      { url: "/icon?size=192", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon?size=32"],
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${googleAnalyticsId}', {
              cookie_domain: window.location.hostname === 'localhost'
                ? 'none'
                : window.location.hostname
            });
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased selection:bg-indigo-500/30`}
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
