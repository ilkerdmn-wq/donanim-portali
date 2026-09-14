import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSessionToken } from "@/app/lib/admin-auth";

const ADMIN_COOKIE_NAME =
  "donanim_admin_session";

const BUCKET_NAME =
  "review-images";

const MAX_FILE_SIZE =
  8 * 1024 * 1024;

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase ortam deÄŸiÅŸkenleri eksik."
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

function extensionFor(
  mimeType: string
) {
  if (
    mimeType === "image/png"
  ) {
    return "png";
  }

  if (
    mimeType === "image/webp"
  ) {
    return "webp";
  }

  return "jpg";
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
      return NextResponse.json(
        {
          success: false,
          error:
            "Yetkisiz iÅŸlem.",
        },
        {
          status: 401,
        }
      );
    }

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GÃ¶rsel dosyasÄ± seÃ§ilmedi.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !allowedMimeTypes.includes(
        file.type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Sadece JPG, PNG veya WEBP yÃ¼klenebilir.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GÃ¶rsel en fazla 8 MB olabilir.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const extension =
      extensionFor(
        file.type
      );

    const storagePath =
      `covers/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const bytes =
      await file.arrayBuffer();

    const {
      error: uploadError,
    } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(
        storagePath,
        bytes,
        {
          contentType:
            file.type,
          cacheControl:
            "31536000",
          upsert: false,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data,
    } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(
        storagePath
      );

    if (!data.publicUrl) {
      throw new Error(
        "GÃ¶rsel URL'si oluÅŸturulamadÄ±."
      );
    }

    return NextResponse.json({
      success: true,
      url:
        data.publicUrl,
      path:
        storagePath,
    });
  } catch (error: any) {
    console.error(
      "İnceleme kapak yÃ¼kleme hatasÄ±:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "GÃ¶rsel yÃ¼klenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}
