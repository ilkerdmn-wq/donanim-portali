import { NextResponse } from "next/server";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
};

function cleanText(
  value: unknown,
  maxLength: number
) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as ContactPayload;

    const name = cleanText(body.name, 80);
    const email = cleanText(body.email, 160)
      .toLowerCase();
    const subject = cleanText(body.subject, 120);
    const message = cleanText(body.message, 3000);
    const website = cleanText(body.website, 200);

    // Basit bot tuzağı.
    // Normal kullanıcı bu gizli alanı görmez.
    if (website) {
      return NextResponse.json({
        success: true,
      });
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          error:
            "Lütfen adınızı girin.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          error:
            "Geçerli bir e-posta adresi girin.",
        },
        {
          status: 400,
        }
      );
    }

    if (subject.length < 3) {
      return NextResponse.json(
        {
          error:
            "Lütfen mesaj konusunu girin.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        {
          error:
            "Mesajınız en az 10 karakter olmalıdır.",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "İletişim API: Supabase ortam değişkenleri eksik."
      );

      return NextResponse.json(
        {
          error:
            "Mesaj servisi şu anda kullanılamıyor.",
        },
        {
          status: 500,
        }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/contact_messages`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization:
            `Bearer ${serviceRoleKey}`,
          "Content-Type":
            "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          status: "new",
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "İletişim mesajı Supabase'e kaydedilemedi:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Mesajınız kaydedilemedi. Lütfen daha sonra tekrar deneyin.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "İletişim API hatası:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Beklenmeyen bir hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}