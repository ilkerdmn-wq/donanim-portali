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
  normalizeComparison,
} from "@/app/lib/manual-comparison";

import {
  deleteComparisonBySlug,
  readComparisonBySlug,
  saveComparisonBySlug,
} from "@/app/lib/manual-comparison-server";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
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
    const {
      slug,
    } = await context.params;

    const document =
      await readComparisonBySlug(
        slug
      );

    if (!document) {
      return NextResponse.json(
        {
          error:
            "Karşılaştırma bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: reviews,
      error,
    } =
      await supabaseAdmin
        .from("reviews")
        .select(
          "slug,title,image_url"
        )
        .eq(
          "published",
          true
        )
        .order("title");

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        document,
        reviews:
          reviews || [],
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
      "Laptop comparison detail GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Karşılaştırma yüklenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
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
    const {
      slug: oldSlug,
    } = await context.params;

    const existing =
      await readComparisonBySlug(
        oldSlug
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Karşılaştırma bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    const incoming =
      normalizeComparison(
        await request.json()
      );

    if (
      !incoming.title
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
      !incoming.slug
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

    if (
      incoming.slug !==
      oldSlug
    ) {
      const slugConflict =
        await readComparisonBySlug(
          incoming.slug
        );

      if (slugConflict) {
        return NextResponse.json(
          {
            error:
              "Bu sayfa adresi başka bir karşılaştırma tarafından kullanılıyor.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const document =
      normalizeComparison({
        ...incoming,

        id:
          existing.id,

        createdAt:
          existing.createdAt,
      });

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

    if (
      oldSlug !==
      saved.slug
    ) {
      await deleteComparisonBySlug(
        oldSlug
      );
    }

    return NextResponse.json(
      {
        document: saved,
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
      "Laptop comparison detail PUT error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : "Karşılaştırma kaydedilemedi.",
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
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
    const {
      slug,
    } = await context.params;

    const existing =
      await readComparisonBySlug(
        slug
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Karşılaştırma bulunamadı.",
        },
        {
          status: 404,
        }
      );
    }

    await deleteComparisonBySlug(
      slug
    );

    return NextResponse.json(
      {
        success: true,
      }
    );
  } catch (error) {
    console.error(
      "Laptop comparison DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Karşılaştırma silinemedi.",
      },
      {
        status: 500,
      }
    );
  }
}