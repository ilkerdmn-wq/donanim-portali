import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Donanım Portalı'nın kişisel veri, çerez ve reklam teknolojileri hakkındaki gizlilik politikası.",
  alternates: { canonical: "/gizlilik-politikasi" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="GİZLİLİK"
      title="Gizlilik Politikası"
      intro="Bu politika, Donanım Portalı'nı kullanırken hangi bilgilerin işlendiğini ve bu bilgilerin hangi amaçla kullanıldığını açıklar."
      sections={[
        {
          title: "Toplanan bilgiler",
          paragraphs: [
            "Sitemizi ziyaret ettiğinde teknik kullanım verileri; tarayıcı türü, cihaz bilgisi, IP adresi, ziyaret edilen sayfalar ve benzeri günlük kayıtları hizmet sağlayıcıları tarafından işlenebilir.",
            "İletişim formunu kullandığında adın, e-posta adresin, konu ve mesajın talebine yanıt vermek amacıyla kaydedilir.",
          ],
        },
        {
          title: "Bilgileri kullanma amacımız",
          paragraphs: ["Bilgiler; siteyi güvenli ve çalışır tutmak, iletişim taleplerini yanıtlamak, hataları gidermek, kullanım deneyimini geliştirmek ve yasal yükümlülükleri yerine getirmek için kullanılır."],
        },
        {
          title: "Google reklamları ve çerezler",
          paragraphs: [
            "Sitede Google AdSense reklam teknolojileri kullanılabilir. Google ve diğer üçüncü taraf sağlayıcılar, reklam sunmak ve reklamların performansını ölçmek için çerezler, web işaretçileri, IP adresleri veya benzer tanımlayıcılar kullanabilir.",
            "Google'ın reklam çerezlerini kullanması, ziyaretçilerin bu siteye veya diğer sitelere yaptıkları önceki ziyaretlere göre reklam gösterilmesine yardımcı olabilir. Kişiselleştirilmiş reklam tercihlerini Google Reklam Ayarları üzerinden yönetebilirsin.",
          ],
        },
        {
          title: "Üçüncü taraf hizmetler",
          paragraphs: ["Altyapı, veri depolama, analiz veya reklam hizmeti sağlayan üçüncü taraflar kendi gizlilik politikalarına göre veri işleyebilir. Bu hizmetlerin uygulamalarını düzenli olarak gözden geçirmen önerilir."],
        },
        {
          title: "Politika değişiklikleri",
          paragraphs: ["Bu politika, hizmetlerimiz veya yasal gereklilikler değiştiğinde güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır."],
        },
      ]}
    />
  );
}
