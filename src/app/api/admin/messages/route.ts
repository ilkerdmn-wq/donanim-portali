import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_COOKIE_NAME = "donanim_admin_session";

const allowedStatuses = [
  "new",
  "read",
  "replied",
  "archived",
] as const;

type MessageStatus =
  (typeof allowedStatuses)[number];

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

  const data = new TextEncoder().encode(
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

  return currentToken === expectedToken;
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
      .from("contact_messages")
      .select(
        "id,name,email,subject,message,status,created_at"
      )
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
      messages: data || [],
    });
  } catch (error: any) {
    console.error(
      "Mesajlar yükleme hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Mesajlar yüklenemedi.",
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
      String(
        body?.id || ""
      ).trim();

    const status =
      String(
        body?.status || ""
      ) as MessageStatus;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mesaj kimliği eksik.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Geçersiz mesaj durumu.",
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
      .from("contact_messages")
      .update({
        status,
      })
      .eq(
        "id",
        id
      )
      .select(
        "id,name,email,subject,message,status,created_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: data,
    });
  } catch (error: any) {
    console.error(
      "Mesaj güncelleme hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Mesaj güncellenemedi.",
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
      searchParams
        .get("id")
        ?.trim() || "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mesaj kimliği eksik.",
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
      .from("contact_messages")
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
      "Mesaj silme hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Mesaj silinemedi.",
      },
      {
        status: 500,
      }
    );
  }
}
