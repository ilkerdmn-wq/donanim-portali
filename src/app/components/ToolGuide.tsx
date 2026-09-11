type ToolKey =
  | "fps"
  | "darbogaz"
  | "psu"
  | "toplama"
  | "pc-oneri"
  | "birim"
  | "resim"
  | "belge"
  | "steam";

type Guide = {
  title: string;
  intro: string;
  steps: string[];
  note: string;
};

const guides: Record<ToolKey, Guide> = {
  fps: {
    title: "FPS hesaplama sonucu nasıl yorumlanır?",
    intro: "Bu araç, seçilen işlemci ve ekran kartının farklı oyunlardaki olası kare hızı seviyesini karşılaştırmalı olarak gösterir. Sonuçlar, sistem seçimi yaparken yaklaşık bir referans oluşturur.",
    steps: [
      "Önce işlemci ve ekran kartını seç, ardından oynadığın çözünürlüğü belirle.",
      "Orta ve ultra ayarlar arasındaki farkı birlikte değerlendir; yalnızca tek bir FPS değerine göre karar verme.",
      "Ray tracing, DLSS/FSR, sürücü sürümü, RAM kapasitesi ve oyun yamaları gerçek sonucu değiştirebilir.",
    ],
    note: "Tahminler benchmark veya oyun içi ölçümün yerine geçmez. Satın alma kararında bağımsız testleri ve kendi kullanım senaryonu da kontrol et.",
  },
  darbogaz: {
    title: "Darboğaz yüzdesi ne anlama gelir?",
    intro: "Darboğaz analizi, işlemci ile ekran kartının seçilen çözünürlükteki göreli dengesini tahmini olarak inceler. Yüksek değer, mutlaka kötü deneyim yaşanacağı anlamına gelmez.",
    steps: [
      "Aynı sistemi 1080p, 1440p ve 4K için ayrı değerlendirmek daha sağlıklı sonuç verir.",
      "1080p çözünürlükte işlemci yükü, yüksek çözünürlüklerde ise ekran kartı yükü daha belirleyici olabilir.",
      "RAM hızı, oyun motoru, arka plan uygulamaları ve sıcaklıklar sonuç üzerinde etkili olur.",
    ],
    note: "Araçtaki yüzde değerini kesin performans kaybı olarak değil, parça dengesini araştırmaya başlamak için bir işaret olarak kullan.",
  },
  psu: {
    title: "Güç kaynağı seçerken nelere bakılmalı?",
    intro: "PSU hesaplayıcı, bileşenlerin tahmini tüketimini toplar ve güvenli bir güç payı ile öneri sunar. Sadece watt değeri değil, güç kaynağının kalitesi de önemlidir.",
    steps: [
      "İşlemci, ekran kartı ve depolama bileşenlerini mümkün olduğunca doğru seç.",
      "Önerilen watt değerinin üzerinde, pay bırakacak bir model tercih et.",
      "80 Plus verimliliği, koruma devreleri, bağlantı sayısı ve üretici garantisini ayrıca incele.",
    ],
    note: "Ekran kartlarında anlık güç sıçramaları görülebilir. Özellikle üst seviye sistemlerde üreticinin önerdiği PSU kapasitesini önceliklendir.",
  },
  toplama: {
    title: "PC toplarken uyumluluk kontrolü",
    intro: "PC Toplama Sihirbazı, temel bileşenleri bir araya getirirken uyumlu seçenekleri daraltmaya yardımcı olur. Son seçimden önce fiziksel ve elektriksel ayrıntıları doğrulamak gerekir.",
    steps: [
      "İşlemci ve anakart soketini, RAM türünü ve kasa form faktörünü kontrol et.",
      "Ekran kartının kasa uzunluğu ile soğutucunun kasa yüksekliğini karşılaştır.",
      "Güç kaynağının watt kapasitesi yanında gerekli PCIe ve CPU güç bağlantılarını da doğrula.",
    ],
    note: "Araç temel uyumluluk kontrolleri yapar. BIOS sürümü, M.2 hat paylaşımı ve kasa içi hava akışı gibi ayrıntılar için üretici teknik sayfalarına bak.",
  },
  "pc-oneri": {
    title: "Otomatik sistem önerisini kullanma",
    intro: "Bu araç, bütçe, kullanım amacı ve çözünürlüğe göre güncel fiyatlı bileşenlerden dengeli bir başlangıç sistemi oluşturur. Öneri, kişisel ihtiyaçlarına göre düzenlenebilir bir taslaktır.",
    steps: [
      "Bütçeyi seçerken monitör, işletim sistemi ve çevre birimleri için ayrı pay ayır.",
      "Oyun, ofis veya render kullanım amacını gerçek önceliğine göre belirle.",
      "Öneri çıktısındaki soket, bellek tipi, güç kaynağı ve depolama bilgisini satın almadan önce tekrar kontrol et.",
    ],
    note: "Fiyatlar ve stoklar hızlı değişebilir. Aynı bütçede birden fazla yapılandırmayı karşılaştırmak genellikle daha iyi sonuç verir.",
  },
  birim: {
    title: "Depolama ve frekans birimleri",
    intro: "Birim dönüştürücü; depolama kapasitesi ile işlemci veya bellek frekansı gibi değerleri hızlıca karşılaştırmak için kullanılır.",
    steps: [
      "Depolama hesabında üreticilerin bazen ondalık, işletim sistemlerinin ise ikili gösterim kullandığını unutma.",
      "İnternet hızındaki Mbps ile dosya aktarımındaki MB/s aynı birim değildir; 8 bit, 1 byte eder.",
      "GHz ve MHz dönüşümü frekans değerini değiştirir, donanımın gerçek hızını artırmaz.",
    ],
    note: "Dönüşüm sonucu matematiksel değerdir; işletim sistemi ve üretici ekranlarında yuvarlama farkları görülebilir.",
  },
  resim: {
    title: "Görsel dönüştürürken kaliteyi koruma",
    intro: "Resim aracı, dosyayı tarayıcıda dönüştürerek PNG, JPG veya WebP çıktısı oluşturur. Bu yaklaşım, dosyanın uzak bir sunucuya yüklenmeden işlenmesine yardımcı olur.",
    steps: [
      "Şeffaflık gerekiyorsa PNG veya WebP kullan; JPG şeffaf alanları desteklemez.",
      "WebP çoğu web görselinde daha düşük dosya boyutu sağlayabilir.",
      "Dönüştürmeden önce orijinal dosyanı sakla; kayıplı formatlar ayrıntı kaybına neden olabilir.",
    ],
    note: "Büyük görseller tarayıcı belleğini zorlayabilir. Özellikle çok yüksek çözünürlüklü dosyalarda boyutlandırma yaparak ilerle.",
  },
  belge: {
    title: "Belge dönüştürme hakkında",
    intro: "Belge aracı, desteklenen dosyalardan pratik çıktılar oluşturmayı amaçlar. Dosya yapısı ve kaynak formatı, dönüştürme sonucunun ayrıntı düzeyini etkiler.",
    steps: [
      "Kaynak dosyanın yedeğini her zaman sakla.",
      "Tablo ve özel biçimlendirme içeren belgelerde çıktıyı indirmeden önce kontrol et.",
      "Hassas kişisel veya kurumsal belgeleri işlerken cihaz ve tarayıcı güvenliğine dikkat et.",
    ],
    note: "Biçim dönüşümü her kaynak formatın tüm özelliklerini koruyamayabilir. Kritik belgeleri resmî yazılımlarla da doğrulaman önerilir.",
  },
  steam: {
    title: "İndirme süresi hesabını doğru okumak",
    intro: "Steam indirme süresi hesaplayıcısı, oyun boyutu ve bağlantı hızına göre yaklaşık süre verir. Gerçek süre, internet bağlantısının anlık durumuna göre değişir.",
    steps: [
      "İnternet paketindeki Mbps değerini gir; MB/s değeri kullanıyorsan önce 8 ile çarp.",
      "Oyunun gösterilen boyutu ile indirilen sıkıştırılmış veri boyutu farklı olabilir.",
      "Sunucu yoğunluğu, Wi-Fi kalitesi, disk hızı ve Steam'in dosya açma işlemi süreyi uzatabilir.",
    ],
    note: "Sonucu en iyi senaryo olarak düşünmek yerine, bağlantındaki dalgalanma için ek süre bırakarak plan yap.",
  },
};

export default function ToolGuide({ tool }: { tool: ToolKey }) {
  const guide = guides[tool];

  return (
    <section className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
      <p className="text-[10px] font-black tracking-[0.16em] text-cyan-400 uppercase">
        ARAÇ REHBERİ
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">
        {guide.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
        {guide.intro}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {guide.steps.map((step, index) => (
          <div key={step} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-xs font-black text-cyan-400">{String(index + 1).padStart(2, "0")}</span>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{step}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-6 text-amber-100/80">
        {guide.note}
      </p>
    </section>
  );
}
