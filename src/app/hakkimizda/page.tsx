import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Donanım Portalı'nın amacı, yayın ilkeleri ve içerik yaklaşımı.",
  alternates: { canonical: "/hakkimizda" },
};

export default function AboutPage() {
  return (
    <LegalPage
      eyebrow="DONANIM PORTALI"
      title="Hakkımızda"
      intro="Donanım Portalı; bilgisayar donanımı, teknoloji haberleri ve pratik araçları anlaşılır bilgilerle bir araya getiren bağımsız bir içerik platformudur."
      sections={[
        {
          title: "Amacımız",
          paragraphs: [
            "Bir bilgisayar parçasını seçmek, sistem toplamak veya teknik bir kavramı anlamak isteyen kullanıcılara açık, güncel ve faydalı içerik sunmayı amaçlıyoruz.",
            "Haberler, rehberler ve araçlar; araştırma sürecini kısaltmak ve daha bilinçli karar vermeye yardımcı olmak için hazırlanır.",
          ],
        },
        {
          title: "İçerik yaklaşımımız",
          paragraphs: [
            "İçeriklerimiz yayımlanmadan önce doğruluk, güncellik ve kullanıcı yararı açısından gözden geçirilir. Teknik bilgiler, ürün özellikleri ve fiyatlar zaman içinde değişebileceğinden ilgili sayfalardaki bilgiler düzenli olarak kontrol edilir.",
          ],
          items: [
            "Haber, rehber ve araç içeriklerinde anlaşılır bir dil kullanırız.",
            "Kaynak gerektiren içeriklerde kaynak bilgisine yer vermeye çalışırız.",
            "Kullanıcı geri bildirimleriyle hataları düzeltir ve içerikleri geliştiririz.",
          ],
        },
        {
          title: "Bağımsızlık",
          paragraphs: [
            "Donanım Portalı'ndaki değerlendirmeler bilgi verme amacı taşır. Bir ürünün sitede yer alması, o ürünün herkese uygun olduğu veya satın alınmasının garanti edildiği anlamına gelmez.",
          ],
        },
      ]}
    />
  );
}
