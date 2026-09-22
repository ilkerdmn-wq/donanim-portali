import { notFound } from "next/navigation";

export default function HardwareLayout({
  children: _children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  notFound();
}