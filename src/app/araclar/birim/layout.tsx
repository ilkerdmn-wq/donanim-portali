import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dijital Birim Dönüştürücü",
  description: "Bit, byte, KB, MB, GB ve TB gibi dijital veri birimlerini hızlıca dönüştürün.",
  alternates: { canonical: "/araclar/birim" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
