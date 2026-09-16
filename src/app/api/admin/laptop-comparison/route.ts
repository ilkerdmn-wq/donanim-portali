import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/app/lib/admin-auth";

import {
  supabaseAdmin,
} from "@/app/lib/supabase-admin";

import {
  emptyComparison,
  normalizeComparison,
} from "@/app/lib/manual-comparison";

import {
  listComparisons,
  readComparisonBySlug,
  saveComparisonBySlug,
} from "@/app/lib/manual-comparison-server";

export async function GET(
  request: NextRequest
) {
  if (
    !(await isAdminAuthenticated(
      request
    ))
  ) {
    return NextResponse.json(
      {
        error:
          "Yetkisiz işlem.",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const [
      comparisons,
      reviews,
    ] =
      await Promise.all([
        listComparisons(),

        supabaseAdmin
          .from("reviews")
          .select(
            "slug,title,image_url"
          )
          .eq(
            "published",
            true
          )
          .order("title"),
      ]);

    if (
      reviews.error
    ) {
      throw reviews.error;
    }

    return NextResponse.json(
      {
        comparisons,

        reviews:
          reviews.data || [],

        emptyDocument:
          emptyComparison(),
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Laptop comparison GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Karşılaştırmalar yüklenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  if (
    !(await isAdminAuthenticated(
      request
    ))
  ) {
    return NextResponse.json(
      {
        error:
          "Yetkisiz işlem.",
      },
      {
        status: 401,
      }
    );
  }

  const origin =
    request.headers.get(
      "origin"
    );

  if (
    origin &&
    origin !==
      new URL(
        request.url
      ).origin
  ) {
    return NextResponse.json(
      {
        error:
          "Yetkisiz işlem.",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const document =
      normalizeComparison(
        await request.json()
      );

    if (
      !document.title
    ) {
      return NextResponse.json(
        {
          error:
            "Karşılaştırma başlığı gerekli.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !document.slug
    ) {
      return NextResponse.json(
        {
          error:
            "Sayfa adresi oluşturulamadı.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await readComparisonBySlug(
        document.slug
      );

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Bu sayfa adresiyle daha önce bir karşılaştırma oluşturulmuş.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      document.published
    ) {
      const slugs =
        document.columns.map(
          (column) =>
            column.reviewSlug
        );

      if (
        new Set(
          slugs
        ).size !==
        slugs.length
      ) {
        return NextResponse.json(
          {
            error:
              "Her laptop için ayrı bir inceleme seç.",
          },
          {
            status: 400,
          }
        );
      }

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from("reviews")
          .select("slug")
          .eq(
            "published",
            true
          )
          .in(
            "slug",
            slugs
          );

      if (error) {
        throw error;
      }

      if (
        (data || [])
          .length !==
        slugs.length
      ) {
        return NextResponse.json(
          {
            error:
              "Her sütun için yayımlanmış inceleme seç.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const saved =
      await saveComparisonBySlug(
        document
      );

    return NextResponse.json(
      {
        document: saved,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Laptop comparison POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Kaydedilemedi.",
      },
      {
        status: 400,
      }
    );
  }
}