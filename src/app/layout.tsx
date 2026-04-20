import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ValoPickr — Find your Valorant Teammate",
  description: "Find the perfect Valorant teammate. Filter by rank, swipe, match and play.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
