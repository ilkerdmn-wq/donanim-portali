import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Steam Araçları",
  description: "Steam oyunları ve hesabınızla ilgili kullanışlı bilgilere tek noktadan ulaşın.",
  alternates: { canonical: "/araclar/steam" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
