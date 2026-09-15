export type Component = { name: string; performance_order: number | null } | null;
export type Laptop = {
  id: string; brand: string; model: string; image_url: string; review_slug: string;
  processor: Component; graphics: Component; graphics_watts: number | null;
  ram_gb: number | null; ram_speed_mhz: number | null; ram_upgradable: string;
  screen_inches: number | null; resolution: string; panel: string; refresh_hz: number | null;
  brightness_nits: number | null; color_gamut: string; ssd_gb: number | null;
  ssd_type: string; battery_wh: number | null; weight_kg: number | null;
  ports: string; wireless: string; notes: string;
};

export type ComparisonRow = {
  label: string; left: string; right: string; stronger: "left" | "right" | null;
  group: string;
};

function display(value: string | number | null | undefined, suffix = "") {
  return value === null || value === undefined || value === "" ? "Belirtilmedi" : `${value}${suffix}`;
}

function numericEdge(left: number | null, right: number | null, lower = false): "left" | "right" | null {
  if (left === null || right === null || left === right) return null;
  return (lower ? left < right : left > right) ? "left" : "right";
}

function componentEdge(left: Component, right: Component): "left" | "right" | null {
  if (!left?.performance_order || !right?.performance_order || left.performance_order === right.performance_order) return null;
  // Katalogda düşük sıra daha güçlüdür. Sıra editör tarafından doğrulanmadan boş bırakılır.
  return left.performance_order < right.performance_order ? "left" : "right";
}

export function compareLaptops(left: Laptop, right: Laptop): ComparisonRow[] {
  const row = (group: string, label: string, a: string, b: string, stronger: ComparisonRow["stronger"] = null): ComparisonRow => ({group,label,left:a,right:b,stronger});
  return [
    row("Performans", "Mobil işlemci", display(left.processor?.name), display(right.processor?.name), componentEdge(left.processor,right.processor)),
    row("Performans", "Mobil ekran kartı", display(left.graphics?.name), display(right.graphics?.name), left.graphics_watts !== null && left.graphics_watts === right.graphics_watts ? componentEdge(left.graphics,right.graphics) : null),
    row("Performans", "Ekran kartı güç sınırı", display(left.graphics_watts," W"), display(right.graphics_watts," W")),
    row("Bellek ve depolama", "RAM kapasitesi", display(left.ram_gb," GB"), display(right.ram_gb," GB"), numericEdge(left.ram_gb,right.ram_gb)),
    row("Bellek ve depolama", "RAM hızı", display(left.ram_speed_mhz," MHz"), display(right.ram_speed_mhz," MHz")),
    row("Bellek ve depolama", "RAM yükseltme", display(left.ram_upgradable), display(right.ram_upgradable)),
    row("Bellek ve depolama", "SSD kapasitesi", display(left.ssd_gb," GB"), display(right.ssd_gb," GB"), numericEdge(left.ssd_gb,right.ssd_gb)),
    row("Bellek ve depolama", "SSD türü", display(left.ssd_type), display(right.ssd_type)),
    row("Ekran", "Ekran boyutu", display(left.screen_inches," inç"), display(right.screen_inches," inç")),
    row("Ekran", "Çözünürlük", display(left.resolution), display(right.resolution)),
    row("Ekran", "Panel", display(left.panel), display(right.panel)),
    row("Ekran", "Yenileme hızı", display(left.refresh_hz," Hz"), display(right.refresh_hz," Hz"), numericEdge(left.refresh_hz,right.refresh_hz)),
    row("Ekran", "Parlaklık", display(left.brightness_nits," nit"), display(right.brightness_nits," nit"), numericEdge(left.brightness_nits,right.brightness_nits)),
    row("Ekran", "Renk kapsamı", display(left.color_gamut), display(right.color_gamut)),
    row("Taşınabilirlik", "Pil kapasitesi", display(left.battery_wh," Wh"), display(right.battery_wh," Wh"), numericEdge(left.battery_wh,right.battery_wh)),
    row("Taşınabilirlik", "Ağırlık", display(left.weight_kg," kg"), display(right.weight_kg," kg"), numericEdge(left.weight_kg,right.weight_kg,true)),
    row("Bağlantı ve diğer", "Bağlantı noktaları", display(left.ports), display(right.ports)),
    row("Bağlantı ve diğer", "Kablosuz bağlantı", display(left.wireless), display(right.wireless)),
  ];
}
