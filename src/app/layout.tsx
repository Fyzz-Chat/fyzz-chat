import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import type React from "react";
import { Providers } from "@/components/providers";
import SnowfallCanvas from "@/components/snowfall-canvas";
import { Toaster } from "@/components/ui/sonner";
import conf from "@/lib/config";
import { canonicalUrl, metaDescription, metaTitle, openGraph } from "@/lib/metadata";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
  twitter: {
    card: "summary_large_image",
    title: metaTitle,
    description: metaDescription,
  },
  category: "",
  keywords: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex min-h-svh min-w-80 flex-col justify-center md:overscroll-none",
          inter.variable
        )}
      >
        {process.env.NODE_ENV === "development" && process.env.REACT_SCAN === "true" && (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            crossOrigin="anonymous"
          />
        )}
        <Providers>
          {children}
          <Toaster position="top-right" />
          <SnowfallCanvas />
        </Providers>
      </body>
    </html>
  );
}
