
export type ComparisonColumn = { id: string; name: string; reviewSlug: string };
export type ComparisonCell = { value: string; highlighted: boolean };
export type ComparisonRow = { id: string; label: string; cells: Record<string, ComparisonCell> };
export type ManualComparison = { title: string; published: boolean; columns: ComparisonColumn[]; rows: ComparisonRow[]; updatedAt: string };

export const featureLabels = ["İşlemci", "RAM kapasitesi", "RAM hızı", "RAM yükseltme", "Ekran", "Yenileme hızı", "Parlaklık", "Renk kapsamı", "SSD", "Dahili grafik", "Thunderbolt 4", "Wi-Fi", "Bluetooth", "Pil kapasitesi", "Ağırlık", "Kalınlık", "Kamera çözünürlüğü"];

export function emptyComparison(): ManualComparison {
  const columns = [{id:"laptop-1",name:"",reviewSlug:""},{id:"laptop-2",name:"",reviewSlug:""}];
  return {title:"Laptop karşılaştırması",published:false,columns,rows:featureLabels.map((label,index)=>({id:`feature-${index+1}`,label,cells:{"laptop-1":{value:"",highlighted:false},"laptop-2":{value:"",highlighted:false}}})),updatedAt:""};
}

export function normalizeComparison(value: unknown): ManualComparison {
  if (!value || typeof value !== "object") throw new Error("Geçersiz karşılaştırma verisi.");
  const input = value as Record<string,unknown>;
  if (!Array.isArray(input.columns) || input.columns.length < 2 || input.columns.length > 3 || !Array.isArray(input.rows) || input.rows.length > 60) throw new Error("İki veya üç laptop ve en fazla 60 özellik girilebilir.");
  const trim = (v:unknown,max:number) => typeof v === "string" ? v.trim().slice(0,max) : "";
  const columns = input.columns.map((item,index)=>{const col=item as Record<string,unknown>;return {id:`laptop-${index+1}`,name:trim(col?.name,180),reviewSlug:trim(col?.reviewSlug,220)};});
  const rows = input.rows.map((item,index)=>{const row=item as Record<string,unknown>;const oldCells=(row?.cells && typeof row.cells === "object") ? row.cells as Record<string,unknown> : {};const cells:Record<string,ComparisonCell>={};columns.forEach((col,colIndex)=>{const oldId=trim((input.columns as Record<string,unknown>[])[colIndex]?.id,40);const cell=(oldCells[oldId]||oldCells[col.id]||{}) as Record<string,unknown>;cells[col.id]={value:trim(cell.value,300),highlighted:cell.highlighted===true};});return {id:`feature-${index+1}`,label:trim(row?.label,100),cells};});
  const published=input.published===true;
  if (published && (columns.some(col=>!col.name || !col.reviewSlug) || !rows.length || rows.some(row=>!row.label))) throw new Error("Yayınlamak için model adlarını, incelemeleri ve özellik satırlarını doldur.");
  return {title:trim(input.title,180)||"Laptop karşılaştırması",published,columns,rows,updatedAt:new Date().toISOString()};
}
