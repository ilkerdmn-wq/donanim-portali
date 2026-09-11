import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Sorumluluk Reddi",
  description: "Donanım Portalı'ndaki fiyat, ürün ve hesaplama araçları için sorumluluk reddi açıklaması.",
  alternates: { canonical: "/sorumluluk-reddi" },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="BİLGİLENDİRME"
      title="Sorumluluk Reddi"
      intro="Donanım Portalı'ndaki içerikler, araçlar ve fiyat bilgileri karar verme sürecine yardımcı olmak amacıyla sunulur; bağlayıcı tavsiye veya garanti niteliği taşımaz."
      sections={[
        {
          title: "Fiyat ve stok bilgileri",
          paragraphs: ["Ürün fiyatları, stok durumu, kampanyalar ve teknik özellikler kaynak sitelerde anlık olarak değişebilir. Satın alma öncesinde satıcı sayfasındaki güncel bilgileri kontrol etmelisin."],
        },
        {
          title: "Hesaplama ve öneri araçları",
          paragraphs: ["FPS, darboğaz, güç kaynağı ve sistem önerisi araçları tahmini sonuç üretir. Sonuçlar, gerçek kullanım koşulları, sürücüler, oyun sürümü, sıcaklıklar ve seçilen bileşenler nedeniyle farklılık gösterebilir."],
        },
        {
          title: "Satın alma kararları",
          paragraphs: ["Uyumluluk, performans, garanti, iade koşulları ve bütçe gibi unsurları kendi ihtiyaçlarına göre değerlendirmen gerekir. Sitedeki bilgilere dayanılarak verilen satın alma kararlarından ziyaretçi sorumludur."],
        },
      ]}
    />
  );
}
