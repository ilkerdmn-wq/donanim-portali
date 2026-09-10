import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site İçi Arama",
  description:
    "Donanım Portalı içinde haber, rehber ve donanım içeriklerinde arama yapın.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
