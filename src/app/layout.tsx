import type { Metadata } from "next";
import Script from "next/script";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import SiteShell from "./components/SiteShell";
import ScrollToTop from "./components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://donanimportali.com"
  ),

  title: {
    default: "Donanım Portalı",
    template: "%s | Donanım Portalı",
  },

  description:
    "Güncel donanım haberleri, PC toplama araçları, FPS ve darboğaz hesaplayıcıları, PSU hesaplama ve bilgisayar donanımı rehberleri.",

  verification: {
    google:
      "Z2Mu8qKQpPKFOlm7jrw5OIRQQqmp1KAHLshmrj7T3a4",
  },

  keywords: [
    "donanım",
    "bilgisayar donanımı",
    "pc toplama",
    "ekran kartı",
    "işlemci",
    "anakart",
    "ram",
    "ssd",
    "güç kaynağı",
    "fps hesaplama",
    "darboğaz hesaplama",
    "psu hesaplama",
    "pc önerisi",
    "teknoloji haberleri",
  ],

  authors: [
    {
      name: "Donanım Portalı",
    },
  ],

  creator: "Donanım Portalı",
  publisher: "Donanım Portalı",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://donanimportali.com",
    siteName: "Donanım Portalı",
    title: "Donanım Portalı",
    description:
      "Güncel donanım haberleri, PC toplama ve sistem analiz araçları.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Donanım Portalı",
    description:
      "Güncel donanım haberleri, PC toplama ve sistem analiz araçları.",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className="dark"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen flex flex-col selection:bg-cyan-500 selection:text-zinc-950`}
      >
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5297887307944126"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />

        <SiteShell>
          <ScrollToTop />
          {children}
        </SiteShell>
      </body>
    </html>
  );
}