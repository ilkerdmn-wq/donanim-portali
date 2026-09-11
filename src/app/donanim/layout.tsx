import type { Metadata } from "next";

const SITE_URL =
  "https://donanimportali.com";

export const metadata: Metadata = {
  title:
    "Donanım Kategorileri",

  description:
    "İşlemci, ekran kartı, anakart, RAM, güç kaynağı ve depolama bileşenlerini teknik özellikleriyle inceleyin.",

  alternates: {
    canonical:
      `${SITE_URL}/donanim`,
  },

  openGraph: {
    type:
      "website",

    locale:
      "tr_TR",

    url:
      `${SITE_URL}/donanim`,

    siteName:
      "Donanım Portalı",

    title:
      "Donanım Kategorileri",

    description:
      "İşlemci, ekran kartı, anakart, RAM, PSU ve depolama bileşenlerini inceleyin.",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Donanım Kategorileri",

    description:
      "İşlemci, ekran kartı, anakart, RAM, PSU ve depolama bileşenlerini inceleyin.",
  },
};

export default function HardwareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
