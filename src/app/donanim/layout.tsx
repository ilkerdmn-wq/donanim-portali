import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donanım Kategorileri",
  description:
    "İşlemci, ekran kartı, anakart, RAM, güç kaynağı ve depolama ürünlerini teknik özellikleriyle inceleyin.",
  alternates: {
    canonical: "https://donanimportali.com/donanim",
  },
};

export default function HardwareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
