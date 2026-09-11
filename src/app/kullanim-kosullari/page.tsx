import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "Donanım Portalı kullanım koşulları ve ziyaretçi sorumlulukları.",
  alternates: { canonical: "/kullanim-kosullari" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="KULLANIM"
      title="Kullanım Koşulları"
      intro="Bu siteyi kullanarak aşağıdaki koşulları kabul etmiş sayılırsın. Koşulları kabul etmiyorsan siteyi kullanmamalısın."
      sections={[
        {
          title: "İçeriğin kullanımı",
          paragraphs: ["Sitedeki metinler, tasarımlar, görseller ve araçlar bilgi amaçlıdır. İçeriği kaynak göstermeden kopyalamak, yeniden yayımlamak veya ticari amaçla kullanmak için önceden izin alınması gerekir."],
        },
        {
          title: "Kullanıcı sorumluluğu",
          paragraphs: ["Ziyaretçiler siteyi yürürlükteki mevzuata uygun biçimde kullanmayı kabul eder. Siteye, altyapısına veya diğer kullanıcıların deneyimine zarar vermeye yönelik girişimler yasaktır."],
        },
        {
          title: "Harici bağlantılar",
          paragraphs: ["Sitede üçüncü taraf sitelere yönlendiren bağlantılar bulunabilir. Bu sitelerin içeriği, güvenliği ve gizlilik uygulamalarından Donanım Portalı sorumlu değildir."],
        },
        {
          title: "Değişiklikler",
          paragraphs: ["Bu koşullar gerektiğinde güncellenebilir. Güncel koşulların düzenli olarak gözden geçirilmesi ziyaretçinin sorumluluğundadır."],
        },
      ]}
    />
  );
}
