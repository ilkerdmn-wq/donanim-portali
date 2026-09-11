import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  importInventusCategory,
  type ImportCategory,
} from "../../../lib/inventus-importer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedCategories: ImportCategory[] = [
  "anakartlar",
  "islemciler",
  "ekran-kartlari",
  "bellekler",
  "guc-kaynaklari",
  "depolama",
];

function isAuthorized(request: NextRequest) {
  const secret = process.env.PRICE_UPDATE_SECRET;

  if (!secret) return false;

  return request.headers.get("x-price-update-secret") === secret;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetkisiz istek.",
        },
        { status: 401 }
      );
    }

    const category =
      request.nextUrl.searchParams.get("category");

    const commit =
      request.nextUrl.searchParams.get("commit") === "true";

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Kategori belirtilmedi.",
          allowed: [...allowedCategories, "all"],
        },
        { status: 400 }
      );
    }

    if (category === "all") {
      const results = [];

      for (const item of allowedCategories) {
        const result = await importInventusCategory(
          item,
          commit
        );

        results.push(result);
      }

      return NextResponse.json({
        success: results.every((item) => item.success),
        mode: commit ? "commit" : "preview",
        categories: results.length,
        totals: {
          found: results.reduce(
            (sum, item) => sum + item.found,
            0
          ),
          inserted: results.reduce(
            (sum, item) => sum + item.inserted,
            0
          ),
          updated: results.reduce(
            (sum, item) => sum + item.updated,
            0
          ),
          sourcesCreated: results.reduce(
            (sum, item) => sum + item.sourcesCreated,
            0
          ),
          errors: results.reduce(
            (sum, item) => sum + item.errors.length,
            0
          ),
        },
        results,
      });
    }

    if (
      !allowedCategories.includes(
        category as ImportCategory
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz kategori.",
          allowed: [...allowedCategories, "all"],
        },
        { status: 400 }
      );
    }

    const result = await importInventusCategory(
      category as ImportCategory,
      commit
    );

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error: any) {
    console.error(
      "INVENTUS IMPORT API HATASI:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message || "Bilinmeyen hata.",
      },
      { status: 500 }
    );
  }
}
