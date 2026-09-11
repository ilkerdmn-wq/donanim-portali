import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PSU Güç Kaynağı Hesaplama",
  description: "Bilgisayar bileşenlerinize göre önerilen güç kaynağı kapasitesini watt cinsinden hesaplayın.",
  alternates: { canonical: "/araclar/psu" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
