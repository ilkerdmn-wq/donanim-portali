import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import SiteShell from "./components/SiteShell";

const geistSans = Geist({
  variable:
    "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",
    subsets: ["latin"],
  });

export const metadata: Metadata = {
  title: "Donanım Portalı",
  description:
    "Yeni nesil teknoloji üssü ve donanım rehberi",
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
        <SiteShell>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
