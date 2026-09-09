type PriceResult = {
  price: number;
  currency?: string;
};

function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  let text = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/₺/g, "")
    .replace(/TL/gi, "")
    .replace(/TRY/gi, "");

  if (!text) {
    return null;
  }

  if (text.includes(",") && text.includes(".")) {
    const lastComma = text.lastIndexOf(",");
    const lastDot = text.lastIndexOf(".");

    if (lastComma > lastDot) {
      // 34.579,90
      text = text.replace(/\./g, "").replace(",", ".");
    } else {
      // 34,579.90
      text = text.replace(/,/g, "");
    }
  } else if (text.includes(",")) {
    // 34579,90
    text = text.replace(",", ".");
  } else {
    // 34.579
    const parts = text.split(".");

    if (
      parts.length === 2 &&
      parts[1].length === 3
    ) {
      text = parts.join("");
    }
  }

  text = text.replace(/[^\d.]/g, "");

  const price = Number(text);

  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }

  return price;
}

function findOfferPrice(data: any): PriceResult | null {
  if (!data) {
    return null;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const result = findOfferPrice(item);

      if (result) {
        return result;
      }
    }

    return null;
  }

  if (typeof data !== "object") {
    return null;
  }

  const type = data["@type"];

  const types = Array.isArray(type)
    ? type
    : [type];

  if (
    types.some(
      (item) =>
        String(item).toLowerCase() === "product"
    )
  ) {
    const offers = data.offers;

    if (offers) {
      const result = findOfferPrice(offers);

      if (result) {
        return result;
      }
    }
  }

  if (
    types.some((item) => {
      const value = String(item).toLowerCase();

      return (
        value === "offer" ||
        value === "aggregateoffer"
      );
    })
  ) {
    const possiblePrices = [
      data.price,
      data.lowPrice,
      data.highPrice,
    ];

    for (const possiblePrice of possiblePrices) {
      const price = normalizePrice(possiblePrice);

      if (price !== null) {
        return {
          price,
          currency:
            data.priceCurrency ||
            data.currency ||
            undefined,
        };
      }
    }

    if (data.offers) {
      const result = findOfferPrice(data.offers);

      if (result) {
        return result;
      }
    }
  }

  for (const value of Object.values(data)) {
    if (
      value &&
      (typeof value === "object" ||
        Array.isArray(value))
    ) {
      const result = findOfferPrice(value);

      if (result) {
        return result;
      }
    }
  }

  return null;
}

function extractFromMeta(html: string): PriceResult | null {
  const metaPatterns = [
    /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:amount["']/i,

    /<meta[^>]+itemprop=["']price["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']price["']/i,

    /<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:price:amount["']/i,
  ];

  for (const pattern of metaPatterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      const price = normalizePrice(match[1]);

      if (price !== null) {
        return {
          price,
          currency: "TRY",
        };
      }
    }
  }

  return null;
}

function extractFromHtmlText(
  html: string
): PriceResult | null {
  const patterns = [
    /["']price["']\s*:\s*["']?([\d.,]+)["']?/i,

    /["']special_price["']\s*:\s*["']?([\d.,]+)["']?/i,

    /["']finalPrice["']\s*:\s*["']?([\d.,]+)["']?/i,

    /["']final_price["']\s*:\s*["']?([\d.,]+)["']?/i,

    /["']productPrice["']\s*:\s*["']?([\d.,]+)["']?/i,

    /([\d]{1,3}(?:\.[\d]{3})+(?:,[\d]{2})?)\s*(?:TL|₺)/i,

    /([\d]{4,}(?:,[\d]{2})?)\s*(?:TL|₺)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      const price = normalizePrice(match[1]);

      if (
        price !== null &&
        price >= 100
      ) {
        return {
          price,
          currency: "TRY",
        };
      }
    }
  }

  return null;
}

export async function extractPriceFromUrl(
  url: string
): Promise<PriceResult> {
  const response = await fetch(url, {
    cache: "no-store",

    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36",

      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

      "Accept-Language":
        "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    },

    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `Sayfa alınamadı. HTTP ${response.status}`
    );
  }

  const html = await response.text();

  /*
    1. JSON-LD
  */
  const scriptRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  const matches = [
    ...html.matchAll(scriptRegex),
  ];

  for (const match of matches) {
    const jsonText = match[1]?.trim();

    if (!jsonText) {
      continue;
    }

    try {
      const data = JSON.parse(jsonText);

      const result = findOfferPrice(data);

      if (result) {
        return result;
      }
    } catch {
      // sonraki JSON-LD bloğuna geç
    }
  }

  /*
    2. META etiketleri
  */
  const metaResult = extractFromMeta(html);

  if (metaResult) {
    return metaResult;
  }

  /*
    3. Sayfa HTML / script içindeki fiyat
  */
  const htmlResult =
    extractFromHtmlText(html);

  if (htmlResult) {
    return htmlResult;
  }

  throw new Error(
    "Sayfa okunabildi ancak fiyat değeri bulunamadı."
  );
}