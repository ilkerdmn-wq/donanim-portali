import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Belge Araçları",
  description: "Günlük belge işlemlerini tarayıcınızdan hızlı ve kolay biçimde gerçekleştirin.",
  alternates: { canonical: "/araclar/belge" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
