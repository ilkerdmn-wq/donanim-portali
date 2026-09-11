import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "../../../lib/supabase-admin";
import { extractPriceFromUrl } from "../../../lib/price-extractor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PriceSource = {
  id: number;
  hardware_id: number;
  source_name: string;
  product_url: string;
  is_active: boolean;
  priority: number;
};

type UpdateResult = {
  hardware_id: number;
  success: boolean;
  source_id?: number;
  source_name?: string;
  price?: number;
  currency?: string;
  error?: string;
  tried_sources?: number;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAuthorized(request: NextRequest) {
  const expectedManualSecret =
    process.env.PRICE_UPDATE_SECRET;

  const cronSecret =
    process.env.CRON_SECRET;

  const receivedManualSecret =
    request.headers.get("x-price-update-secret");

  if (
    expectedManualSecret &&
    receivedManualSecret === expectedManualSecret
  ) {
    return true;
  }

  /*
    OTOMATİK CRON

    Authorization:
    Bearer CRON_SECRET
  */
  const authorization =
    request.headers.get("authorization");

  if (
    cronSecret &&
    authorization === `Bearer ${cronSecret}`
  ) {
    return true;
  }

  return false;
}

export async function GET(
  request: NextRequest
) {
  try {
    /*
      YETKİ KONTROLÜ
    */
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetkisiz istek.",
        },
        {
          status: 401,
        }
      );
    }

    /*
      AKTİF FİYAT KAYNAKLARINI ÇEK
    */
    const { data, error } =
      await supabaseAdmin
        .from("hardware_price_sources")
        .select(`
          id,
          hardware_id,
          source_name,
          product_url,
          is_active,
          priority
        `)
        .eq("is_active", true)
        .order("hardware_id", {
          ascending: true,
        })
        .order("priority", {
          ascending: true,
        })
        .order("id", {
          ascending: true,
        });

    if (error) {
      throw error;
    }

    const sources =
      (data || []) as PriceSource[];

    /*
      AYNI DONANIMIN FİYAT KAYNAKLARINI
      GRUPLA
    */
    const groupedSources =
      new Map<number, PriceSource[]>();

    for (const source of sources) {
      const current =
        groupedSources.get(
          source.hardware_id
        ) || [];

      current.push(source);

      groupedSources.set(
        source.hardware_id,
        current
      );
    }

    const results: UpdateResult[] = [];

    /*
      HER DONANIM İÇİN
      KAYNAKLARI ÖNCELİK SIRASIYLA DENE
    */
    for (const [
      hardwareId,
      productSources,
    ] of groupedSources.entries()) {
      let productUpdated = false;

      let lastError = "";

      let triedSources = 0;

      /*
        PRIORITY:

        1 → Ana kaynak
        2 → Yedek
        3 → İkinci yedek
      */
      for (const source of productSources) {
        triedSources++;

        const checkedAt =
          new Date().toISOString();

        try {
          /*
            SİTEDEN FİYATI ÇEK
          */
          const priceResult =
            await extractPriceFromUrl(
              source.product_url
            );

          /*
            FİYAT KONTROLÜ
          */
          if (
            !Number.isFinite(
              priceResult.price
            ) ||
            priceResult.price <= 0
          ) {
            throw new Error(
              "Geçersiz fiyat değeri."
            );
          }

          /*
            FİYAT GEÇMİŞİNE EKLE
          */
          const {
            error: priceInsertError,
          } = await supabaseAdmin
            .from("hardware_prices")
            .insert({
              hardware_id:
                hardwareId,

              store_name:
                source.source_name,

              price:
                priceResult.price,

              product_url:
                source.product_url,

              is_available:
                true,

              checked_at:
                checkedAt,
            });

          if (priceInsertError) {
            throw priceInsertError;
          }

          /*
            ANA ÜRÜNDEKİ GÜNCEL FİYATI
            DEĞİŞTİR
          */
          const {
            error: hardwareUpdateError,
          } = await supabaseAdmin
            .from("hardware_items")
            .update({
              price:
                priceResult.price,

              price_source:
                source.source_name,

              price_url:
                source.product_url,

              price_updated_at:
                checkedAt,
            })
            .eq(
              "id",
              hardwareId
            );

          if (hardwareUpdateError) {
            throw hardwareUpdateError;
          }

          /*
            FİYAT KAYNAĞININ DURUMUNU
            GÜNCELLE
          */
          const {
            error: sourceUpdateError,
          } = await supabaseAdmin
            .from(
              "hardware_price_sources"
            )
            .update({
              last_price:
                priceResult.price,

              last_checked_at:
                checkedAt,

              last_success_at:
                checkedAt,

              last_error:
                null,

              updated_at:
                checkedAt,
            })
            .eq(
              "id",
              source.id
            );

          if (sourceUpdateError) {
            throw sourceUpdateError;
          }

          /*
            BAŞARILI SONUCU EKLE
          */
          results.push({
            hardware_id:
              hardwareId,

            success:
              true,

            source_id:
              source.id,

            source_name:
              source.source_name,

            price:
              priceResult.price,

            currency:
              priceResult.currency ||
              "TRY",

            tried_sources:
              triedSources,
          });

          /*
            ANA/YEDek KAYNAKLARDAN
            BİRİ BAŞARILI OLDU.

            ARTIK DİĞER KAYNAKLARI
            DENEME.
          */
          productUpdated = true;

          break;
        } catch (error: any) {
          lastError =
            error?.message ||
            "Bilinmeyen hata";

          console.error(
            `Fiyat kaynağı başarısız.

Hardware ID: ${hardwareId}
Kaynak: ${source.source_name}
Hata: ${lastError}`
          );

          /*
            BAŞARISIZ KAYNAĞIN
            SON KONTROL BİLGİSİNİ KAYDET
          */
          await supabaseAdmin
            .from(
              "hardware_price_sources"
            )
            .update({
              last_checked_at:
                checkedAt,

              last_error:
                lastError,

              updated_at:
                checkedAt,
            })
            .eq(
              "id",
              source.id
            );
        }

        /*
          ANA KAYNAK BAŞARISIZSA
          YEDEĞE GEÇMEDEN ÖNCE BEKLE.
        */
        await wait(1500);
      }

      /*
        TÜM KAYNAKLAR BAŞARISIZSA
        MEVCUT ÜRÜN FİYATINA DOKUNMA.
      */
      if (!productUpdated) {
        results.push({
          hardware_id:
            hardwareId,

          success:
            false,

          error:
            lastError ||
            "Hiçbir fiyat kaynağı çalışmadı.",

          tried_sources:
            triedSources,
        });
      }

      /*
        SONRAKİ ÜRÜNE GEÇMEDEN ÖNCE
        BEKLE.
      */
      await wait(1200);
    }

    /*
      SONUÇLARI SAY
    */
    const successful =
      results.filter(
        (item) =>
          item.success
      ).length;

    const failed =
      results.filter(
        (item) =>
          !item.success
      ).length;

    /*
      API SONUCU
    */
    return NextResponse.json({
      success:
        true,

      updated_at:
        new Date().toISOString(),

      products:
        results.length,

      successful,

      failed,

      results,
    });
  } catch (error: any) {
    console.error(
      "TOPLU FİYAT GÜNCELLEME HATASI:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Bilinmeyen hata oluştu.",
      },
      {
        status: 500,
      }
    );
  }
}
