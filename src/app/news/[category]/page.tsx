import type { Metadata } from "next";
import {
  notFound,
} from "next/navigation";

import NewsCategoryClient from "./NewsCategoryClient";

type PageProps = {
  params: Promise<{
    category: string;
  }>;
};

const SITE_URL =
  "https://donanim-portali.vercel.app";

const categorySeo: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  genel: {
    title: "Genel Haberler",
    description:
      "Teknoloji dünyasından genel gelişmeler, duyurular ve güncel haberler.",
  },

  donanim: {
    title: "Donanım Haberleri",
    description:
      "İşlemci, ekran kartı, anakart, bellek ve diğer donanım gelişmeleri.",
  },

  yazilim: {
    title: "Yazılım Haberleri",
    description:
      "İşletim sistemleri, uygulamalar, geliştirici araçları ve yazılım dünyasındaki gelişmeler.",
  },

  oyun: {
    title: "Oyun Haberleri",
    description:
      "PC ve konsol oyunları, güncellemeler, performans ve oyun dünyasından gelişmeler.",
  },

  "yapay-zeka": {
    title: "Yapay Zeka Haberleri",
    description:
      "Yapay zeka modelleri, araçlar, yeni teknolojiler ve sektördeki güncel gelişmeler.",
  },

  mobil: {
    title: "Mobil Haberler",
    description:
      "Akıllı telefonlar, tabletler, mobil işletim sistemleri ve mobil teknoloji haberleri.",
  },
};

function normalizeCategory(
  value: string
) {
  return decodeURIComponent(
    value || ""
  )
    .toLocaleLowerCase(
      "tr-TR"
    )
    .trim();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams =
    await params;

  const category =
    normalizeCategory(
      resolvedParams.category
    );

  const seo =
    categorySeo[category];

  if (!seo) {
    return {
      title:
        "Haber kategorisi bulunamadı",

      description:
        "Aradığınız haber kategorisi bulunamadı.",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical =
    `${SITE_URL}/news/${category}`;

  return {
    title:
      seo.title,

    description:
      seo.description,

    alternates: {
      canonical,
    },

    openGraph: {
      type:
        "website",

      locale:
        "tr_TR",

      url:
        canonical,

      siteName:
        "Donanım Portalı",

      title:
        seo.title,

      description:
        seo.description,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        seo.title,

      description:
        seo.description,
    },
  };
}

export default async function NewsCategoryPage({
  params,
}: PageProps) {
  const resolvedParams =
    await params;

  const category =
    normalizeCategory(
      resolvedParams.category
    );

  if (
    !categorySeo[category]
  ) {
    notFound();
  }

  return (
    <NewsCategoryClient
      categorySlug={
        category
      }
    />
  );
}
