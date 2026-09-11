import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resim Boyutlandırma Aracı",
  description: "Resimlerinizi tarayıcınızda kolayca yeniden boyutlandırın ve kullanıma hazırlayın.",
  alternates: { canonical: "/araclar/resim" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
