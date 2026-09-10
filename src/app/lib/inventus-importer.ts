import * as cheerio from "cheerio";
import { supabaseAdmin } from "./supabase-admin";

export type ImportCategory =
  | "anakartlar"
  | "islemciler"
  | "ekran-kartlari"
  | "bellekler"
  | "guc-kaynaklari"
  | "depolama";

type InventusProduct = {
  rawName: string;
  name: string;
  slug: string;
  category: ImportCategory;
  price: number;
  productUrl: string;
  description: string;
  specs: Record<string, string>;
};

export type ImportPreviewItem = {
  rawName: string;
  name: string;
  price: number;
  productUrl: string;
  specs: Record<string, string>;
  matchStatus: "existing" | "new";
  existingId?: number;
};

export type ImportResult = {
  success: boolean;
  category: ImportCategory;
  mode: "preview" | "commit";
  found: number;
  inserted: number;
  updated: number;
  sourcesCreated: number;
  skipped: number;
  errors: string[];
  preview: ImportPreviewItem[];
};

const INVENTUS_BASE_URL = "https://inventus.com.tr";

const CATEGORY_CONFIG: Record<
  ImportCategory,
  { dtid: number; label: string }
> = {
  anakartlar: { dtid: 1, label: "anakart" },
  islemciler: { dtid: 2, label: "işlemci" },
  "ekran-kartlari": { dtid: 21, label: "ekran kartı" },
  bellekler: { dtid: 26, label: "bellek" },
  "guc-kaynaklari": { dtid: 41, label: "güç kaynağı" },
  depolama: { dtid: 2267, label: "depolama" },
};

function cleanText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createSlug(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeModelName(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\b(kutusuz|tray|box|mpk)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function extractPid(url: string) {
  try {
    return new URL(url).searchParams.get("PID") || "";
  } catch {
    return "";
  }
}

function parsePrice(value: string): number | null {
  const patterns = [
    /(\d{1,3}(?:\.\d{3})+(?:,\d{2})?)\s*(?:TL|₺)/i,
    /(\d{4,}(?:,\d{2})?)\s*(?:TL|₺)/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match?.[1]) continue;

    const number = Number(
      match[1].replace(/\./g, "").replace(",", ".")
    );

    if (Number.isFinite(number) && number > 100) {
      return number;
    }
  }

  return null;
}

function stripCommonSalesText(value: string) {
  return cleanText(
    value
      .replace(/\b(?:Sepete Ekle|Ürün tedarik edilemiyor)\b.*$/i, "")
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/\s{2,}/g, " ")
  );
}

function cleanMotherboardName(rawName: string) {
  let name = stripCommonSalesText(rawName);

  const cut = name.search(
    /\s+(?:AMD|Intel)\s+(?:A\d{3}|B\d{3}|X\d{3}E?|Z\d{3}|H\d{3}|Q\d{3}|TRX\d+|WRX\d+)\b/i
  );

  if (cut > 0) name = name.slice(0, cut);

  name = name
    .replace(/\s+Anakart$/i, "")
    .replace(/,\s*(?:DDR[345]|AM[345]|LGA\d+|PCI-?E|PCIe|SATA|M\.2|USB).*$/i, "");

  return cleanText(name);
}

function cleanProcessorName(rawName: string) {
  let name = stripCommonSalesText(rawName)
    .replace(/\s+İşlemci$/i, "");

  const cuts = [
    /\s+\d+(?:[.,]\d+)?\s*-\s*\d+(?:[.,]\d+)?\s*GHz/i,
    /\s+\d+(?:[.,]\d+)?\s*GHz/i,
    /,\s*\d+\s*MB\b/i,
    /,\s*\d+\s*W\b/i,
    /,\s*\d+\s*\/\s*\d+\b/i,
    /,\s*(?:AM4|AM5|LGA\d+)\b/i,
    /,\s*DDR[45]\b/i,
  ];

  let cutAt = name.length;
  for (const pattern of cuts) {
    const pos = name.search(pattern);
    if (pos > 0 && pos < cutAt) cutAt = pos;
  }

  name = name.slice(0, cutAt)
    .replace(/\b(?:TRAY|BOX|MPK|KUTUSUZ)\b/gi, " ")
    .replace(/\bsoğutucu\s+yok\b/gi, " ");

  return cleanText(name);
}

function cleanGpuName(rawName: string) {
  let name = stripCommonSalesText(rawName)
    .replace(/\s+Ekran kart[ıi]$/i, "");

  const cutPatterns = [
    /\s+Ekran kart[ıi] belleği\b/i,
    /\s+Ekran kart[ıi] giriş\/çıkış\b/i,
    /\s+Ekran kart[ıi] güç\b/i,
    /\s+PCI-?E(?:16X|x16)?\b/i,
    /,\s*(?:PCI-?E|GDDR|HDMI|DisplayPort)\b/i,
  ];

  let cutAt = name.length;
  for (const pattern of cutPatterns) {
    const pos = name.search(pattern);
    if (pos > 0 && pos < cutAt) cutAt = pos;
  }

  name = cleanText(name.slice(0, cutAt));

  // Aynı GPU modeli başlık sonunda ikinci kez yazılmışsa kaldır.
  const trailingGpu = name.match(
    /\s+(RTX\s?\d{4}(?:\s?Ti|\s?SUPER)?|GTX\s?\d{3,4}(?:\s?Ti)?|RX\s?\d{4}(?:\s?XT)?|GT\s?\d{3,4})$/i
  );

  if (trailingGpu?.[1]) {
    const before = name.slice(0, trailingGpu.index).replace(/[^a-z0-9]/gi, "").toLowerCase();
    const gpu = trailingGpu[1].replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (before.includes(gpu)) {
      name = name.slice(0, trailingGpu.index);
    }
  }

  return cleanText(name);
}

function cleanMemoryName(rawName: string) {
  let name = stripCommonSalesText(rawName)
    .replace(/\s+Bellek$/i, "");

  // Zamanlama/voltaj gibi satış detaylarını başlıktan çıkar.
  const cut = name.search(
    /\s+\(\d{1,2}-\d{1,2}-\d{1,2}(?:-\d{1,2})?\)|\s+\d+(?:[.,]\d+)?V\b/i
  );
  if (cut > 0) name = name.slice(0, cut);

  // Kapasiteden sonraki gereksiz teknik metni kırp.
  const capacity = name.match(
    /^(.{1,140}?\b\d+\s*GB\b(?:\s*\(\s*\d+\s*x\s*\d+\s*GB\s*\))?)/i
  );
  if (capacity?.[1]) name = capacity[1];

  return cleanText(name);
}

function cleanPsuName(rawName: string) {
  let name = stripCommonSalesText(rawName)
    .replace(/\s+Güç kaynağı$/i, "");

  // Watt bilgisini koru, devamındaki 80+, ATX, PCIe vb. ayrıntıları çıkar.
  const watt = name.match(/^(.{1,140}?\b\d{3,4}\s*W\b)/i);
  if (watt?.[1]) {
    name = watt[1];
  } else {
    const cut = name.search(/\s+80\+\b|,\s*ATX\b|,\s*PCI-?E\b/i);
    if (cut > 0) name = name.slice(0, cut);
  }

  // "PRO 1000 1000W" gibi tekrarları sadeleştir.
  name = name.replace(/\b(\d{3,4})\s+\1W\b/i, "$1W");

  return cleanText(name);
}

function cleanStorageName(rawName: string) {
  let name = stripCommonSalesText(rawName)
    .replace(/\s+SSD sabitdisk$/i, "")
    .replace(/\s+Sabitdisk$/i, "");

  // Hız bilgisinden sonrasını başlıktan çıkar.
  const speedCut = name.search(
    /\s+\d{3,5}\s*-\s*\d{3,5}\s*MB\/s\b|\s+\d{3,5}\s*MB\/s\b/i
  );
  if (speedCut > 0) name = name.slice(0, speedCut);

  // Sonunda SSD/NVMe yoksa ve ham adda varsa kısa etiketi ekle.
  if (/\bNVMe\b/i.test(rawName) && !/\bNVMe\b/i.test(name)) {
    name += " NVMe";
  }
  if (/\bSSD\b/i.test(rawName) && !/\bSSD\b/i.test(name)) {
    name += " SSD";
  }

  return cleanText(name);
}

function cleanProductName(category: ImportCategory, rawName: string) {
  switch (category) {
    case "anakartlar":
      return cleanMotherboardName(rawName);
    case "islemciler":
      return cleanProcessorName(rawName);
    case "ekran-kartlari":
      return cleanGpuName(rawName);
    case "bellekler":
      return cleanMemoryName(rawName);
    case "guc-kaynaklari":
      return cleanPsuName(rawName);
    case "depolama":
      return cleanStorageName(rawName);
  }
}

function shortValue(value: string, max = 48) {
  const cleaned = cleanText(
    value
      .replace(/\bSepete Ekle\b.*$/i, "")
      .replace(/\[[^\]]+\]/g, " ")
  );

  return cleaned.length <= max
    ? cleaned
    : cleaned.slice(0, max).trim();
}

function parseMotherboardSpecs(value: string) {
  const text = cleanText(value);
  const specs: Record<string, string> = {};

  const socket = text.match(
    /\b(AM4|AM5|LGA1200|LGA1700|LGA1851|sTR5|sTRX4|TR4)\b/i
  );
  if (socket?.[1]) specs["Soket"] = socket[1].toUpperCase();

  const chipset = text.match(
    /\b(A320|A520|A620|A620A|A620E|B350|B450|B550|B650|B650E|B840|B850|X370|X470|X570|X670|X670E|X870|X870E|H610|H670|H770|H810|B660|B760|B860|Z690|Z790|Z890|W680|W790|TRX40|TRX50|WRX80|WRX90)\b/i
  );
  if (chipset?.[1]) specs["Chipset"] = chipset[1].toUpperCase();

  const memory = text.match(/\bDDR(3|4|5)\b/i);
  if (memory?.[0]) specs["Bellek Türü"] = memory[0].toUpperCase();

  const pcie = text.match(/PCI-?E(?:16X|x16)?\s*([345]\.0)/i);
  if (pcie?.[1]) specs["PCIe"] = `PCIe ${pcie[1]}`;

  const wifi = text.match(/\bWi-?Fi\s*(7|6E|6|5)\b/i);
  if (wifi?.[1]) {
    specs["Wi-Fi"] = `Wi-Fi ${wifi[1].toUpperCase()}`;
  } else if (/\bWi-?Fi\b/i.test(text)) {
    specs["Wi-Fi"] = "Var";
  }

  const bluetooth = text.match(/\bBT\s*([0-9.]+)/i);
  if (bluetooth?.[1]) specs["Bluetooth"] = bluetooth[1];

  if (/\bE-?ATX\b/i.test(text)) {
    specs["Form Faktörü"] = "E-ATX";
  } else if (/\bMicro\s*ATX\b/i.test(text) || /\bmATX\b/i.test(text)) {
    specs["Form Faktörü"] = "Micro ATX";
  } else if (/\bMini\s*ITX\b/i.test(text)) {
    specs["Form Faktörü"] = "Mini ITX";
  } else if (/\bCEB\b/i.test(text)) {
    specs["Form Faktörü"] = "CEB";
  } else if (/\bATX\b/i.test(text)) {
    specs["Form Faktörü"] = "ATX";
  }

  const memorySlots = text.match(
    /(?:bellek soketi|kanal)\D{0,25}(\d+)\s*adet/i
  );
  if (memorySlots?.[1]) specs["RAM Slotu"] = memorySlots[1];

  const maxMemory = text.match(/Maks:\s*(\d+GB)/i);
  if (maxMemory?.[1]) specs["Maks. Bellek"] = maxMemory[1];

  return specs;
}

function parseProcessorSpecs(value: string) {
  const text = cleanText(value);
  const specs: Record<string, string> = {};

  const socket = text.match(
    /\b(AM4|AM5|LGA1200|LGA1700|LGA1851|sTR5|sTRX4|TR4)\b/i
  );
  if (socket?.[1]) specs["Soket"] = socket[1].toUpperCase();

  const clocks = text.match(
    /\b(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)\s*GHz\b/i
  );
  if (clocks) {
    specs["Temel Frekans"] = `${clocks[1].replace(",", ".")} GHz`;
    specs["Boost Frekans"] = `${clocks[2].replace(",", ".")} GHz`;
  } else {
    const base = text.match(
      /(?:İşlemci hızı\s*)?(\d+(?:[.,]\d+)?)\s*GHz/i
    );
    if (base?.[1]) {
      specs["Temel Frekans"] = `${base[1].replace(",", ".")} GHz`;
    }
  }

  const coreThread =
    text.match(/\b(\d{1,3})\s*\/\s*(\d{1,3})\b/);
  if (coreThread) {
    specs["Çekirdek"] = coreThread[1];
    specs["İş Parçacığı"] = coreThread[2];
  }

  const tdp = text.match(/\b(\d{2,3})W\b/i);
  if (tdp?.[1]) specs["TDP"] = `${tdp[1]}W`;

  const cache = text.match(/\b(\d{1,3})MB(?:\s+Cache)?\b/i);
  if (cache?.[1]) specs["Önbellek"] = `${cache[1]}MB`;

  const memory = text.match(/\bDDR(4|5)\b/i);
  if (memory?.[0]) specs["Bellek Desteği"] = memory[0].toUpperCase();

  return specs;
}

function parseGpuSpecs(value: string) {
  const text = cleanText(value);
  const specs: Record<string, string> = {};

  const gpu = text.match(
    /\b(RTX\s?\d{4}(?:\s?Ti|\s?SUPER)?|GTX\s?\d{3,4}(?:\s?Ti)?|RX\s?\d{4}(?:\s?XT)?|GT\s?\d{3,4})\b/i
  );
  if (gpu?.[1]) specs["GPU"] = gpu[1].replace(/\s+/g, "").toUpperCase();

  const memory = text.match(
    /Ekran kart[ıi] belleği\s*(\d+)MB\s*\/\s*(\d+)bit\s*(G?DDR\d)/i
  );
  if (memory) {
    const mb = Number(memory[1]);
    specs["VRAM"] =
      mb >= 1024 && mb % 1024 === 0
        ? `${mb / 1024} GB`
        : `${mb} MB`;
    specs["Bellek Veri Yolu"] = `${memory[2]} bit`;
    specs["Bellek Türü"] = memory[3].toUpperCase();
  } else {
    const gb = text.match(/\b(\d{1,2})\s*GB\b.*?\b(G?DDR\d)\b/i);
    if (gb) {
      specs["VRAM"] = `${gb[1]} GB`;
      specs["Bellek Türü"] = gb[2].toUpperCase();
    }
  }

  const pcie = text.match(
    /(?:Ekran kart[ıi] arayüzü\s*)?PCI-?E(?:16X|x16)?\s*([345](?:\.0)?)/i
  );
  if (pcie?.[1]) {
    const version = pcie[1].includes(".")
      ? pcie[1]
      : `${pcie[1]}.0`;
    specs["Arayüz"] = `PCIe ${version}`;
  }

  const psu = text.match(/güç gereksinimi en az\s*(\d+)W/i);
  if (psu?.[1]) specs["Önerilen PSU"] = `${psu[1]}W`;

  return specs;
}

function parseMemorySpecs(value: string) {
  const text = cleanText(value);
  const specs: Record<string, string> = {};

  const type =
    text.match(/Bellek türü\s*(DDR[345])/i) ||
    text.match(/\b(DDR[345])\b/i);
  if (type?.[1]) specs["Tür"] = type[1].toUpperCase();

  const speed =
    text.match(/Bellek hızı\s*(\d+)MHz/i) ||
    text.match(/\b(\d{4,5})MHz\b/i);
  if (speed?.[1]) specs["Hız"] = `${speed[1]}MHz`;

  const capacity =
    text.match(/Bellek kapasitesi\s*(\d+\s*GB)/i) ||
    text.match(/\b(\d+\s*GB)\b/i);
  if (capacity?.[1]) specs["Kapasite"] = cleanText(capacity[1]);

  const module = text.match(/\b(\d+\s*x\s*\d+\s*GB)\b/i);
  if (module?.[1]) specs["Modül Yapısı"] = cleanText(module[1]);

  const timing =
    text.match(/Bellek zamanı\s*Cas\s*(\d+)/i) ||
    text.match(/\bC(?:L)?(\d{1,2})\b/i);
  if (timing?.[1]) specs["CAS"] = `CL${timing[1]}`;

  const voltage = text.match(/\b([0-9.]+)V\b/i);
  if (voltage?.[1]) specs["Voltaj"] = `${voltage[1]}V`;

  return specs;
}

function parsePsuSpecs(value: string) {
  const text = cleanText(value);
  const specs: Record<string, string> = {};

  const watt = text.match(/\b(\d{3,4})W\b/i);
  if (watt?.[1]) specs["Güç"] = `${watt[1]}W`;

  const efficiency = text.match(
    /\b80\+\s*(Bronze|Silver|Gold|Platinum|Titanium)\b/i
  );
  if (efficiency?.[1]) {
    specs["Verimlilik"] = `80+ ${
      efficiency[1][0].toUpperCase() +
      efficiency[1].slice(1).toLowerCase()
    }`;
  }

  const modular = text.match(/Tak çıkar kablolu\s*(Var|Yok)/i);
  if (modular?.[1]) specs["Modüler"] = modular[1];

  const fan =
    text.match(/Güç kaynağı[^,]{0,40},\s*\d+W,\s*(\d+)mm/i) ||
    text.match(/\b(\d{2,3})mm\b/i);
  if (fan?.[1]) specs["Fan"] = `${fan[1]}mm`;

  if (/Active PFC/i.test(text)) specs["PFC"] = "Active PFC";

  return specs;
}

function parseStorageSpecs(value: string) {
  const text = cleanText(value);
  const specs: Record<string, string> = {};

  const capacity =
    text.match(/Disk kapasitesi\s*(\d+(?:[.,]\d+)?\s*(?:TB|GB))/i) ||
    text.match(/\b(\d+(?:[.,]\d+)?\s*(?:TB|GB))\b/i);
  if (capacity?.[1]) {
    specs["Kapasite"] = capacity[1]
      .replace(",", ".")
      .replace(/\s+/g, " ");
  }

  const read = text.match(/Maks\.?\s*okuma hızı\s*(\d+)MB\/s/i);
  if (read?.[1]) specs["Okuma"] = `${read[1]}MB/s`;

  const write = text.match(/Maks\.?\s*yazma hızı\s*(\d+)MB\/s/i);
  if (write?.[1]) specs["Yazma"] = `${write[1]}MB/s`;

  const pcie =
    text.match(/\bPCIe\s*([345])\.0\b/i) ||
    text.match(/\bGen\s*([345])\s*x/i);
  if (pcie?.[1]) specs["PCIe Nesli"] = `PCIe ${pcie[1]}.0`;

  if (/\bNVMe\b/i.test(text)) {
    specs["Protokol"] = "NVMe";
    specs["Arayüz"] = "M.2 NVMe";
  } else if (/\bM\.2\b/i.test(text)) {
    specs["Arayüz"] = "M.2";
  } else if (/\bSATA\b/i.test(text)) {
    specs["Arayüz"] = "SATA";
  }

  return specs;
}

function parseSpecs(category: ImportCategory, value: string) {
  switch (category) {
    case "anakartlar":
      return parseMotherboardSpecs(value);
    case "islemciler":
      return parseProcessorSpecs(value);
    case "ekran-kartlari":
      return parseGpuSpecs(value);
    case "bellekler":
      return parseMemorySpecs(value);
    case "guc-kaynaklari":
      return parsePsuSpecs(value);
    case "depolama":
      return parseStorageSpecs(value);
  }
}

function buildDescription(
  category: ImportCategory,
  specs: Record<string, string>
) {
  switch (category) {
    case "anakartlar": {
      const parts = [
        specs["Chipset"],
        specs["Soket"],
        specs["Bellek Türü"],
        specs["Form Faktörü"],
      ].filter(Boolean);

      return parts.length
        ? `${parts.join(", ")} özelliklerine sahip anakart.`
        : "Inventus üzerinden güncellenen anakart.";
    }

    case "islemciler": {
      const core =
        specs["Çekirdek"] && specs["İş Parçacığı"]
          ? `${specs["Çekirdek"]} çekirdek / ${specs["İş Parçacığı"]} iş parçacığı`
          : specs["Çekirdek"]
            ? `${specs["Çekirdek"]} çekirdek`
            : "";

      const parts = [
        specs["Soket"],
        core,
        specs["Temel Frekans"],
        specs["Boost Frekans"]
          ? `boost ${specs["Boost Frekans"]}`
          : "",
        specs["TDP"],
      ].filter(Boolean);

      return parts.length
        ? `${parts.join(", ")} özelliklerine sahip işlemci.`
        : "Inventus üzerinden güncellenen işlemci.";
    }

    case "ekran-kartlari": {
      const parts = [
        specs["GPU"],
        specs["VRAM"],
        specs["Bellek Türü"],
        specs["Arayüz"],
      ].filter(Boolean);

      return parts.length
        ? `${parts.join(", ")} özelliklerine sahip ekran kartı.`
        : "Inventus üzerinden güncellenen ekran kartı.";
    }

    case "bellekler": {
      const parts = [
        specs["Kapasite"],
        specs["Tür"],
        specs["Hız"],
        specs["CAS"],
        specs["Modül Yapısı"],
      ].filter(Boolean);

      return parts.length
        ? `${parts.join(", ")} özelliklerine sahip bellek.`
        : "Inventus üzerinden güncellenen bellek.";
    }

    case "guc-kaynaklari": {
      const parts = [
        specs["Güç"],
        specs["Verimlilik"],
        specs["Modüler"]
          ? `modüler: ${specs["Modüler"]}`
          : "",
        specs["PFC"],
      ].filter(Boolean);

      return parts.length
        ? `${parts.join(", ")} özelliklerine sahip güç kaynağı.`
        : "Inventus üzerinden güncellenen güç kaynağı.";
    }

    case "depolama": {
      const parts = [
        specs["Kapasite"],
        specs["Arayüz"],
        specs["Okuma"] ? `okuma ${specs["Okuma"]}` : "",
        specs["Yazma"] ? `yazma ${specs["Yazma"]}` : "",
      ].filter(Boolean);

      return parts.length
        ? `${parts.join(", ")} özelliklerine sahip depolama ürünü.`
        : "Inventus üzerinden güncellenen depolama ürünü.";
    }
  }
}

async function fetchCategoryPage(category: ImportCategory) {
  const config = CATEGORY_CONFIG[category];

  const url =
    `${INVENTUS_BASE_URL}/mi_products/ProductList.aspx?DTID=${config.dtid}`;

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
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    throw new Error(
      `Inventus kategori sayfası alınamadı. HTTP ${response.status}`
    );
  }

  return response.text();
}

function parseProducts(
  html: string,
  category: ImportCategory
): InventusProduct[] {
  const $ = cheerio.load(html);
  const products: InventusProduct[] = [];
  const seenUrls = new Set<string>();
  const usedSlugs = new Set<string>();

  $('a[href*="Product.aspx?PID="]').each(
    (_: number, element: any) => {
      const href = $(element).attr("href");
      if (!href) return;

      let productUrl = "";

      try {
        productUrl = new URL(href, INVENTUS_BASE_URL).toString();
      } catch {
        return;
      }

      if (seenUrls.has(productUrl)) return;

      const rawName = cleanText($(element).text());
      if (!rawName) return;

      const row = $(element).closest("tr");
      const container =
        row.length > 0 ? row : $(element).parent().parent();

      const rowText = cleanText(container.text());

      // Fiyat yoksa / "Ürün tedarik edilemiyor" ise listeye alma.
      const price = parsePrice(rowText);
      if (price === null) return;

      const name = cleanProductName(category, rawName);
      if (!name) return;

      let slug = createSlug(name);
      if (usedSlugs.has(slug)) {
        const pid = extractPid(productUrl);
        slug = `${slug}-inventus-${pid || products.length + 1}`;
      }

      const specs = parseSpecs(
        category,
        `${rawName} ${rowText}`
      );

      products.push({
        rawName,
        name,
        slug,
        category,
        price,
        productUrl,
        specs,
        description: buildDescription(category, specs),
      });

      seenUrls.add(productUrl);
      usedSlugs.add(slug);
    }
  );

  return products;
}

type ExistingHardware = {
  id: number;
  name: string;
  slug: string | null;
  category: string;
};

async function getExistingItems(category: ImportCategory) {
  const { data, error } = await supabaseAdmin
    .from("hardware_items")
    .select("id,name,slug,category")
    .eq("category", category);

  if (error) throw error;

  return (data || []) as ExistingHardware[];
}

function findNameMatch(
  product: InventusProduct,
  existingItems: ExistingHardware[]
) {
  const slugMatch = existingItems.find(
    (item) => item.slug === product.slug
  );
  if (slugMatch) return slugMatch;

  const target = normalizeModelName(product.name);

  const exactName = existingItems.find(
    (item) => normalizeModelName(item.name) === target
  );
  if (exactName) return exactName;

  if (target.length < 12) return null;

  const candidates = existingItems.filter((item) => {
    const current = normalizeModelName(item.name);
    if (current.length < 12) return false;

    return (
      current === target ||
      target.startsWith(current) ||
      current.startsWith(target)
    );
  });

  return candidates.length === 1 ? candidates[0] : null;
}

async function findByProductUrl(productUrl: string) {
  const { data, error } = await supabaseAdmin
    .from("hardware_price_sources")
    .select("hardware_id")
    .eq("source_name", "Inventus")
    .eq("product_url", productUrl)
    .limit(1);

  if (error) throw error;

  return data && data.length > 0
    ? Number(data[0].hardware_id)
    : null;
}

async function upsertSource(
  hardwareId: number,
  product: InventusProduct
) {
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("hardware_price_sources")
    .select("id")
    .eq("hardware_id", hardwareId)
    .eq("source_name", "Inventus")
    .eq("product_url", product.productUrl)
    .limit(1);

  if (error) throw error;

  if (data && data.length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from("hardware_price_sources")
      .update({
        is_active: true,
        priority: 1,
        last_price: product.price,
        last_checked_at: now,
        last_success_at: now,
        last_error: null,
        updated_at: now,
      })
      .eq("id", data[0].id);

    if (updateError) throw updateError;
    return false;
  }

  const { error: insertError } = await supabaseAdmin
    .from("hardware_price_sources")
    .insert({
      hardware_id: hardwareId,
      source_name: "Inventus",
      product_url: product.productUrl,
      priority: 1,
      is_active: true,
      last_price: product.price,
      last_checked_at: now,
      last_success_at: now,
      last_error: null,
    });

  if (insertError) throw insertError;
  return true;
}

export async function importInventusCategory(
  category: ImportCategory,
  commit = false
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    category,
    mode: commit ? "commit" : "preview",
    found: 0,
    inserted: 0,
    updated: 0,
    sourcesCreated: 0,
    skipped: 0,
    errors: [],
    preview: [],
  };

  try {
    const html = await fetchCategoryPage(category);
    const products = parseProducts(html, category);

    result.found = products.length;

    const existingItems = await getExistingItems(category);

    for (const product of products) {
      try {
        const urlHardwareId = await findByProductUrl(
          product.productUrl
        );

        let existing: ExistingHardware | null = null;

        if (urlHardwareId) {
          existing =
            existingItems.find(
              (item) => item.id === urlHardwareId
            ) || null;
        }

        if (!existing) {
          existing = findNameMatch(product, existingItems);
        }

        result.preview.push({
          rawName: product.rawName,
          name: product.name,
          price: product.price,
          productUrl: product.productUrl,
          specs: product.specs,
          matchStatus: existing ? "existing" : "new",
          existingId: existing?.id,
        });
      } catch (error: any) {
        result.errors.push(
          `${product.name}: ${
            error?.message || "Önizleme hatası"
          }`
        );
      }
    }

    // En önemli güvenlik: commit=true yoksa DB'ye dokunma.
    if (!commit) {
      return result;
    }

    for (const product of products) {
      try {
        let hardwareId = await findByProductUrl(
          product.productUrl
        );

        if (!hardwareId) {
          const existing = findNameMatch(
            product,
            existingItems
          );
          if (existing) hardwareId = existing.id;
        }

        const now = new Date().toISOString();

        if (hardwareId) {
          const { error } = await supabaseAdmin
            .from("hardware_items")
            .update({
              name: product.name,
              slug: product.slug,
              description: product.description,
              specs: product.specs,
              price: product.price,
              price_source: "Inventus",
              price_url: product.productUrl,
              price_updated_at: now,
              updated_at: now,
            })
            .eq("id", hardwareId);

          if (error) throw error;
          result.updated++;
        } else {
          const { data, error } = await supabaseAdmin
            .from("hardware_items")
            .insert({
              name: product.name,
              slug: product.slug,
              category: product.category,
              price: product.price,
              description: product.description,
              specs: product.specs,
              price_source: "Inventus",
              price_url: product.productUrl,
              price_updated_at: now,
              updated_at: now,
            })
            .select("id")
            .single();

          if (error) throw error;

          hardwareId = Number(data.id);
          result.inserted++;

          existingItems.push({
            id: hardwareId,
            name: product.name,
            slug: product.slug,
            category: product.category,
          });
        }

        const sourceCreated = await upsertSource(
          hardwareId,
          product
        );

        if (sourceCreated) {
          result.sourcesCreated++;
        }
      } catch (error: any) {
        result.errors.push(
          `${product.name}: ${
            error?.message || "Import hatası"
          }`
        );
      }
    }

    return result;
  } catch (error: any) {
    return {
      ...result,
      success: false,
      errors: [
        error?.message || "Inventus import hatası.",
      ],
    };
  }
}
