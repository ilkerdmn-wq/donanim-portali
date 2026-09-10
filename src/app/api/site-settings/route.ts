import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_COOKIE_NAME = "donanim_admin_session";

type SiteSettingsRow = {
  id: number;
  site_name: string;
  site_slogan: string;
  announcement: string;
  show_announcement: boolean;
  show_prices: boolean;
  show_price_source: boolean;
  maintenance_mode: boolean;
  updated_at: string;
};

type SiteSettingsPayload = {
  siteName: string;
  siteSlogan: string;
  announcement: string;
  showAnnouncement: boolean;
  showPrices: boolean;
  showPriceSource: boolean;
  maintenanceMode: boolean;
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin environment değişkenleri eksik."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function createExpectedAdminToken() {
  const password = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!password || !sessionSecret) {
    return null;
  }

  const data = new TextEncoder().encode(
    `${sessionSecret}:${password}`
  );

  const hash = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
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

function rowToSettings(
  row: SiteSettingsRow
): SiteSettingsPayload {
  return {
    siteName: row.site_name,
    siteSlogan: row.site_slogan,
    announcement: row.announcement,
    showAnnouncement: row.show_announcement,
    showPrices: row.show_prices,
    showPriceSource: row.show_price_source,
    maintenanceMode: row.maintenance_mode,
  };
}

function settingsToRow(
  settings: SiteSettingsPayload
) {
  return {
    id: 1,
    site_name:
      settings.siteName.trim() ||
      "Donanım Portalı",
    site_slogan:
      settings.siteSlogan.trim() ||
      "Haber • Araç • Keşif",
    announcement:
      settings.announcement || "",
    show_announcement:
      Boolean(
        settings.showAnnouncement
      ),
    show_prices:
      Boolean(
        settings.showPrices
      ),
    show_price_source:
      Boolean(
        settings.showPriceSource
      ),
    maintenance_mode:
      Boolean(
        settings.maintenanceMode
      ),
    updated_at:
      new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const supabase =
      getSupabaseAdmin();

    const { data, error } =
      await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      settings: rowToSettings(
        data as SiteSettingsRow
      ),
    });
  } catch (error: any) {
    console.error(
      "Site ayarları GET hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Site ayarları okunamadı.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest
) {
  try {
    const authenticated =
      await isAdminAuthenticated(
        request
      );

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bu işlem için yönetici girişi gerekli.",
        },
        { status: 401 }
      );
    }

    const body =
      (await request.json()) as Partial<SiteSettingsPayload>;

    const supabase =
      getSupabaseAdmin();

    const {
      data: currentRow,
      error: currentError,
    } =
      await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (currentError) {
      throw currentError;
    }

    const currentSettings =
      rowToSettings(
        currentRow as SiteSettingsRow
      );

    const merged: SiteSettingsPayload = {
      ...currentSettings,
      ...body,
    };

    const { data, error } =
      await supabase
        .from("site_settings")
        .upsert(
          settingsToRow(
            merged
          ),
          {
            onConflict: "id",
          }
        )
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      settings:
        rowToSettings(
          data as SiteSettingsRow
        ),
    });
  } catch (error: any) {
    console.error(
      "Site ayarları PUT hatası:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Site ayarları kaydedilemedi.",
      },
      { status: 500 }
    );
  }
}
