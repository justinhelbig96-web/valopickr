import type { Metadata } from "next";
import { Geist, Bebas_Neue, Rajdhani } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PushSetup from "@/components/PushSetup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ValoPickr — Find your Valorant Teammate",
  description: "Tinder for Valorant. Swipe on players, match by rank & playstyle, and find your perfect duo partner.",
  metadataBase: new URL("https://valopickr.vercel.app"),
  openGraph: {
    title: "ValoPickr — Find your Valorant Duo Partner",
    description: "Tinder for Valorant. Swipe on players, match by rank & playstyle, and find your perfect duo partner.",
    url: "https://valopickr.vercel.app",
    siteName: "ValoPickr",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ValoPickr — Tinder for Valorant",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ValoPickr — Find your Valorant Duo Partner",
    description: "Tinder for Valorant. Swipe on players, match by rank & playstyle, and find your perfect duo partner.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${bebasNeue.variable} ${rajdhani.variable} h-full antialiased`}>
      <head>
        {/* Ezoic Privacy Scripts — must load first */}
        <Script data-cfasync="false" src="https://cmp.gatekeeperconsent.com/min.js" strategy="beforeInteractive" />
        <Script data-cfasync="false" src="https://the.gatekeeperconsent.com/cmp.min.js" strategy="beforeInteractive" />
        {/* Ezoic Header Script */}
        <Script src="//www.ezojs.com/ezoic/sa.min.js" strategy="beforeInteractive" />
        <Script id="ezoic-init" strategy="beforeInteractive">{`
          window.ezstandalone = window.ezstandalone || {};
          ezstandalone.cmd = ezstandalone.cmd || [];
        `}</Script>
        <Script src="//ezoicanalytics.com/analytics.js" strategy="afterInteractive" />
      </head>
      <body className="min-h-full flex flex-col">
        <PushSetup />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
