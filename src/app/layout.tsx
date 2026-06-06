import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Fraunces, Inter, Schibsted_Grotesk } from "next/font/google";
import Script from "next/script";
import type React from "react";
import { Providers } from "@/components/providers";
import SnowfallCanvas from "@/components/snowfall-canvas";
import { Toaster } from "@/components/ui/sonner";
import conf from "@/lib/config";
import {
  canonicalUrl,
  metaDescription,
  metaTitle,
  openGraph,
  twitter,
} from "@/lib/metadata";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-schibsted",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(conf.host),
  alternates: {
    canonical: canonicalUrl,
  },
  title: metaTitle,
  description: metaDescription,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
  },
  creator: "Richard Kovacs",
  robots: "index, follow",
  openGraph: {
    ...openGraph,
    url: conf.host,
  },
  twitter,
  category: "",
  keywords: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <body
        className={cn(
          "flex min-h-svh min-w-80 flex-col justify-center md:overscroll-none",
          inter.variable,
          fraunces.variable,
          schibsted.variable
        )}
      >
        <Providers>
          {children}
          <Toaster position="top-right" />
          <SnowfallCanvas />
        </Providers>
        {process.env.NODE_ENV === "development" && process.env.REACT_SCAN === "true" && (
          <Script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
