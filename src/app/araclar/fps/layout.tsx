import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FPS Hesaplama",
  description: "İşlemci, ekran kartı, oyun ve çözünürlük seçerek tahmini FPS değerini hesaplayın.",
  alternates: { canonical: "/araclar/fps" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
