import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PC Toplama Sihirbazı",
  description: "Uyumlu bilgisayar parçalarını seçerek kendi PC sisteminizi adım adım oluşturun.",
  alternates: { canonical: "/araclar/toplama" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
