import type { Metadata } from "next";

import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Donanım Portalı ile iletişime geçin. Görüş, öneri, hata bildirimi ve iş birliği mesajlarınızı bize iletebilirsiniz.",
  alternates: {
    canonical: "/iletisim",
  },
  openGraph: {
    title:
      "İletişim | Donanım Portalı",
    description:
      "Donanım Portalı ile iletişime geçin. Görüş, öneri, hata bildirimi ve iş birliği mesajlarınızı bize iletebilirsiniz.",
    url: "/iletisim",
    type: "website",
  },
};

export default function IletisimPage() {
  return <ContactForm />;
}