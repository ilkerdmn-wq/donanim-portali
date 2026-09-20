import type {
  Metadata,
} from "next";

type CategoryLayoutProps = {
  children: React.ReactNode;

  params: Promise<{
    category: string;
  }>;
};

const categoryMetadata: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  islemciler: {
    title:
      "İşlemciler ve CPU Modelleri | Donanım Portalı",

    description:
      "İşlemci modellerini teknik özellikleriyle inceleyin. CPU modelleri, çekirdek yapıları, frekans değerleri ve donanım özelliklerini karşılaştırın.",
  },

  "ekran-kartlari": {
    title:
      "Ekran Kartları ve GPU Modelleri | Donanım Portalı",

    description:
      "Ekran kartı modellerini ve teknik özelliklerini inceleyin. GPU, bellek, bağlantı ve diğer donanım özelliklerini karşılaştırın.",
  },

  anakartlar: {
    title:
      "Anakart Modelleri | Donanım Portalı",

    description:
      "Anakart modellerini soket, yonga seti, bellek desteği, bağlantılar ve diğer teknik özellikleriyle inceleyin.",
  },

  bellekler: {
    title:
      "RAM ve Bellek Modelleri | Donanım Portalı",

    description:
      "RAM ve bellek modellerini kapasite, bellek türü, hız ve diğer teknik özellikleriyle inceleyin.",
  },

  "guc-kaynaklari": {
    title:
      "Güç Kaynakları ve PSU Modelleri | Donanım Portalı",

    description:
      "Güç kaynağı modellerini watt değeri, verimlilik, bağlantılar ve diğer teknik özellikleriyle inceleyin.",
  },

  depolama: {
    title:
      "SSD ve Depolama Modelleri | Donanım Portalı",

    description:
      "SSD ve depolama ürünlerini kapasite, bağlantı türü ve diğer teknik özellikleriyle inceleyin.",
  },
};

export async function generateMetadata({
  params,
}: CategoryLayoutProps): Promise<Metadata> {
  const { category } =
    await params;

  const info =
    categoryMetadata[
      category
    ];

  if (!info) {
    return {
      title:
        "Donanım | Donanım Portalı",

      description:
        "Bilgisayar donanımı ürünlerini ve teknik özelliklerini inceleyin.",

      alternates: {
        canonical:
          "https://donanimportali.com/donanim",
      },
    };
  }

  const canonical =
    `https://donanimportali.com/donanim/${category}`;

  return {
    title: info.title,

    description:
      info.description,

    alternates: {
      canonical,
    },

    openGraph: {
      title: info.title,
      description:
        info.description,
      url: canonical,
      type: "website",
      siteName:
        "Donanım Portalı",
    },
  };
}

export default function CategoryLayout({
  children,
}: CategoryLayoutProps) {
  return children;
}