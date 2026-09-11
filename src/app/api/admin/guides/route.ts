import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSessionToken } from "@/app/lib/admin-auth";

const ADMIN_COOKIE_NAME = "donanim_admin_session";

function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase ortam değişkenleri eksik."
    );
  }

  return createClient(
    url,
    serviceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function isAdminAuthenticated(
  request: NextRequest
) {
  const currentToken =
    request.cookies.get(
      ADMIN_COOKIE_NAME
    )?.value || "";
  return verifyAdminSessionToken(currentToken);
}

function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      error: "Yetkisiz işlem.",
    },
    {
      status: 401,
    }
  );
}

function cleanText(
  value: unknown,
  maxLength: number
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(
      0,
      maxLength
    );
}

function createSlug(
  value: string
) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeOptionalUrl(
  value: unknown,
  maxLength = 1200
) {
  const raw =
    cleanText(
      value,
      maxLength
    );

  if (!raw) {
    return "";
  }

  if (
    raw.startsWith("/") ||
    raw.startsWith("http://") ||
    raw.startsWith("https://")
  ) {
    return raw;
  }

  return raw;
}

function buildGuidePayload(
  body: any
) {
  const title =
    cleanText(
      body?.title,
      180
    );

  const slug =
    createSlug(
      cleanText(
        body?.slug || title,
        220
      )
    );

  const category =
    cleanText(
      body?.category,
      80
    ) || "Genel";

  const excerpt =
    cleanText(
      body?.excerpt,
      500
    );

  const content =
    cleanText(
      body?.content,
      50000
    );

  const seoTitle =
    cleanText(
      body?.seo_title,
      180
    );

  const seoDescription =
    cleanText(
      body?.seo_description,
      320
    );

  const coverImageUrl =
    normalizeOptionalUrl(
      body?.cover_image_url
    );

  const sourceName =
    cleanText(
      body?.source_name,
      120
    );

  const sourceUrl =
    normalizeOptionalUrl(
      body?.source_url
    );

  const relatedToolLabel =
    cleanText(
      body?.related_tool_label,
      120
    );

  const relatedToolUrl =
    normalizeOptionalUrl(
      body?.related_tool_url,
      500
    );

  return {
    title,
    slug,
    category,
    excerpt,
    content,
    seo_title:
      seoTitle || title,
    seo_description:
      seoDescription || excerpt,
    cover_image_url:
      coverImageUrl,
    source_name:
      sourceName,
    source_url:
      sourceUrl,
    related_tool_label:
      relatedToolLabel,
    related_tool_url:
      relatedToolUrl,
    published:
      Boolean(
        body?.published
      ),
    featured:
      Boolean(
        body?.featured
      ),
    updated_at:
      new Date().toISOString(),
  };
}

export async function GET(
  request: NextRequest
) {
  try {
    if (
      !(await isAdminAuthenticated(
        request
      ))
    ) {
      return unauthorized();
    }

    const supabase =
      getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabase
      .from("guides")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      guides: data || [],
    });
  } catch (error: any) {
    console.error(
      "Rehberler yükleme hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Rehberler yüklenemedi.",
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
  try {
    if (
      !(await isAdminAuthenticated(
        request
      ))
    ) {
      return unauthorized();
    }

    const body =
      await request.json();

    const payload =
      buildGuidePayload(
        body
      );

    if (!payload.title) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Rehber başlığı zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    if (!payload.slug) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Geçerli bir slug oluşturulamadı.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabase
      .from("guides")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      guide: data,
    });
  } catch (error: any) {
    console.error(
      "Rehber oluşturma hatası:",
      error
    );

    const message =
      error?.code ===
      "23505"
        ? "Bu slug zaten kullanılıyor."
        : error?.message ||
          "Rehber oluşturulamadı.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    if (
      !(await isAdminAuthenticated(
        request
      ))
    ) {
      return unauthorized();
    }

    const body =
      await request.json();

    const id =
      Number(
        body?.id
      );

    if (
      !Number.isFinite(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Geçersiz rehber kimliği.",
        },
        {
          status: 400,
        }
      );
    }

    const payload =
      buildGuidePayload(
        body
      );

    if (
      !payload.title ||
      !payload.slug
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Başlık ve slug zorunludur.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabase
      .from("guides")
      .update(payload)
      .eq(
        "id",
        id
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      guide: data,
    });
  } catch (error: any) {
    console.error(
      "Rehber güncelleme hatası:",
      error
    );

    const message =
      error?.code ===
      "23505"
        ? "Bu slug zaten kullanılıyor."
        : error?.message ||
          "Rehber güncellenemedi.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    if (
      !(await isAdminAuthenticated(
        request
      ))
    ) {
      return unauthorized();
    }

    const { searchParams } =
      new URL(request.url);

    const id =
      Number(
        searchParams.get("id")
      );

    if (
      !Number.isFinite(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Geçersiz rehber kimliği.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const {
      error,
    } = await supabase
      .from("guides")
      .delete()
      .eq(
        "id",
        id
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      "Rehber silme hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Rehber silinemedi.",
      },
      {
        status: 500,
      }
    );
  }
}
