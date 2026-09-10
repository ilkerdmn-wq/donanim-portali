import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_COOKIE_NAME =
  "donanim_admin_session";

const BUCKET_NAME =
  "guide-covers";

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

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

async function createExpectedAdminToken() {
  const password =
    process.env.ADMIN_PASSWORD;

  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET;

  if (!password || !sessionSecret) {
    return null;
  }

  const data =
    new TextEncoder().encode(
      `${sessionSecret}:${password}`
    );

  const hash =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  return Array.from(
    new Uint8Array(hash)
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
}

async function isAdminAuthenticated(
  request: NextRequest
) {
  const expectedToken =
    await createExpectedAdminToken();

  if (!expectedToken) {
    return false;
  }

  const currentToken =
    request.cookies.get(
      ADMIN_COOKIE_NAME
    )?.value || "";

  return (
    currentToken ===
    expectedToken
  );
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
            "Yetkisiz işlem.",
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
            "Görsel dosyası seçilmedi.",
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
            "Sadece JPG, PNG veya WEBP yüklenebilir.",
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
            "Görsel en fazla 5 MB olabilir.",
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
        "Görsel URL'si oluşturulamadı."
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
      "Rehber kapak yükleme hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Görsel yüklenemedi.",
      },
      {
        status: 500,
      }
    );
  }
}
