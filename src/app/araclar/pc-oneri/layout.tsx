import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Otomatik PC Toplama Önerisi",
  description: "Bütçe, kullanım amacı ve çözünürlüğe göre güncel fiyatlı, uyumlu bilgisayar sistemi önerisi oluşturun.",
  alternates: { canonical: "/araclar/pc-oneri" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
