import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "Donanım Portalı'nda kullanılan çerezler ve çerez tercihleri hakkında bilgi.",
  alternates: { canonical: "/cerez-politikasi" },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      eyebrow="ÇEREZLER"
      title="Çerez Politikası"
      intro="Çerezler, bir internet sitesini ziyaret ettiğinde tarayıcına kaydedilebilen küçük metin dosyalarıdır. Site deneyiminin düzgün çalışmasına ve reklam teknolojilerinin işlevine yardımcı olabilirler."
      sections={[
        {
          title: "Kullandığımız çerez türleri",
          paragraphs: ["Donanım Portalı'nda aşağıdaki çerez veya benzer teknolojiler kullanılabilir."],
          items: [
            "Zorunlu çerezler: Sitenin temel işlevlerinin çalışmasına yardımcı olur.",
            "Performans çerezleri: Hata tespiti ve kullanım deneyiminin geliştirilmesi için kullanılabilir.",
            "Reklam çerezleri: Google AdSense ve benzeri sağlayıcıların alakalı reklam sunmasına ve reklam performansını ölçmesine yardımcı olabilir.",
          ],
        },
        {
          title: "Çerezleri yönetme",
          paragraphs: ["Tarayıcı ayarlarından çerezleri silebilir, engelleyebilir veya çerez kullanıldığında bildirim almayı seçebilirsin. Çerezleri devre dışı bırakmak bazı site özelliklerinin beklenildiği gibi çalışmamasına neden olabilir."],
        },
        {
          title: "Reklam tercihleri",
          paragraphs: ["Google tarafından sunulan kişiselleştirilmiş reklamlara ilişkin tercihlerini Google Reklam Ayarları üzerinden değiştirebilirsin. Üçüncü taraf reklam ağlarının kendi tercih ve gizlilik sayfaları da uygulanabilir."],
        },
      ]}
    />
  );
}
