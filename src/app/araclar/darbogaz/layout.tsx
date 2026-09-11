import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Darboğaz Hesaplama",
  description: "İşlemci ve ekran kartı uyumunu çözünürlüğe göre analiz ederek olası darboğazı hesaplayın.",
  alternates: { canonical: "/araclar/darbogaz" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
