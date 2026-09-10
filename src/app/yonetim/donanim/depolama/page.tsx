"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  HardDrive,
  Plus,
  Search,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Database,
  ArrowUpDown,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type HardwareItem = {
  id: number;
  slug: string;
  category: string;
  name: string;
  price: number;
  description: string | null;
  specs: Record<string, any> | null;
};

const emptyForm = {
  name: "",
  price: "",
  description: "",
  capacity: "",
  type: "",
  readSpeed: "",
  writeSpeed: "",
  interfaceType: "",
};

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

function getSpec(
  specs: Record<string, any> | null | undefined,
  keys: string[]
) {
  if (!specs) return "";

  for (const key of keys) {
    const value = specs[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  const normalizedKeys = keys.map((key) =>
    key.toLocaleLowerCase("tr-TR")
  );

  for (const [key, value] of Object.entries(specs)) {
    if (
      normalizedKeys.includes(
        key.toLocaleLowerCase("tr-TR")
      ) &&
      value !== undefined &&
      value !== null
    ) {
      return String(value);
    }
  }

  return "";
}

export default function DepolamaYonetimPage() {
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] =
    useState<SortOption>("name-asc");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("hardware_items")
      .select("*")
      .eq("category", "depolama")
      .order("name", { ascending: true });

    if (error) {
      console.error("SUPABASE HATASI:", error);
      alert("Depolama ürünleri yüklenirken hata oluştu.\n\n" + error.message);
      setLoading(false);
      return;
    }

    setItems((data || []) as HardwareItem[]);
    setLoading(false);
  };

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const openNewForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (item: HardwareItem) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      price: String(item.price || ""),
      description: item.description || "",
      capacity: getSpec(item.specs, [
        "Kapasite",
        "kapasite",
      ]),
      type: getSpec(item.specs, [
        "Tür",
        "tür",
        "Protokol",
        "protokol",
      ]),
      readSpeed: getSpec(item.specs, [
        "Okuma",
        "okuma",
      ]),
      writeSpeed: getSpec(item.specs, [
        "Yazma",
        "yazma",
      ]),
      interfaceType: getSpec(item.specs, [
        "Arayüz",
        "arayüz",
      ]),
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Depolama ürünü adı boş bırakılamaz.");
      return;
    }

    if (!form.price.trim()) {
      alert("Fiyat boş bırakılamaz.");
      return;
    }

    const price = Number(form.price);

    if (Number.isNaN(price) || price < 0) {
      alert("Geçerli bir fiyat gir.");
      return;
    }

    setSaving(true);

    const productData = {
      slug: createSlug(form.name),
      category: "depolama",
      name: form.name.trim(),
      price,
      description: form.description.trim(),
      specs: {
        Kapasite: form.capacity.trim(),
        Tür: form.type.trim(),
        Okuma: form.readSpeed.trim(),
        Yazma: form.writeSpeed.trim(),
        Arayüz: form.interfaceType.trim(),
      },
      updated_at: new Date().toISOString(),
    };

    if (editingId !== null) {
      const { error } = await supabase
        .from("hardware_items")
        .update(productData)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        alert("Güncelleme hatası:\n\n" + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("hardware_items")
        .insert(productData);

      if (error) {
        console.error(error);
        alert("Ekleme hatası:\n\n" + error.message);
        setSaving(false);
        return;
      }
    }

    closeForm();
    await loadItems();
    setSaving(false);
  };

  const handleDelete = async (item: HardwareItem) => {
    const confirmed = window.confirm(
      `"${item.name}" ürününü silmek istediğine emin misin?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("hardware_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error(error);
      alert("Silme hatası:\n\n" + error.message);
      return;
    }

    await loadItems();
  };

  const filteredItems = useMemo(() => {
    const q = search
      .trim()
      .toLocaleLowerCase("tr-TR");

    const filtered = !q
      ? [...items]
      : items.filter((item) => {
          const capacity = getSpec(item.specs, [
            "Kapasite",
            "kapasite",
          ]);

          const type = getSpec(item.specs, [
            "Tür",
            "tür",
            "Protokol",
            "protokol",
          ]);

          const readSpeed = getSpec(item.specs, [
            "Okuma",
            "okuma",
          ]);

          const writeSpeed = getSpec(item.specs, [
            "Yazma",
            "yazma",
          ]);

          const interfaceType = getSpec(item.specs, [
            "Arayüz",
            "arayüz",
          ]);

          return (
            item.name
              .toLocaleLowerCase("tr-TR")
              .includes(q) ||
            capacity
              .toLocaleLowerCase("tr-TR")
              .includes(q) ||
            type
              .toLocaleLowerCase("tr-TR")
              .includes(q) ||
            readSpeed
              .toLocaleLowerCase("tr-TR")
              .includes(q) ||
            writeSpeed
              .toLocaleLowerCase("tr-TR")
              .includes(q) ||
            interfaceType
              .toLocaleLowerCase("tr-TR")
              .includes(q)
          );
        });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "name-desc":
          return b.name.localeCompare(
            a.name,
            "tr",
            { sensitivity: "base" }
          );

        case "price-asc":
          return Number(a.price || 0) - Number(b.price || 0);

        case "price-desc":
          return Number(b.price || 0) - Number(a.price || 0);

        case "name-asc":
        default:
          return a.name.localeCompare(
            b.name,
            "tr",
            { sensitivity: "base" }
          );
      }
    });
  }, [items, search, sortOption]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-[1200px] mx-auto px-6 py-10">

        <Link
          href="/yonetim"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Yönetim paneline dön
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <HardDrive size={22} className="text-cyan-400" />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-cyan-400">
                  Donanım Yönetimi
                </p>

                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Database size={10} />
                  SUPABASE
                </span>

              </div>

              <h1 className="text-3xl font-black tracking-tight text-white">
                Depolama
              </h1>

              <p className="text-sm text-zinc-500 mt-1">
                SSD, NVMe ve diğer depolama ürünlerini yönet.
              </p>

            </div>
          </div>

          <button
            onClick={openNewForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black"
          >
            <Plus size={17} />
            Yeni Depolama Ürünü Ekle
          </button>

        </div>

        {showForm && (
          <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900/70 p-6 mb-8">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-lg font-black text-white">
                  {editingId !== null
                    ? "Depolama Ürününü Düzenle"
                    : "Yeni Depolama Ürünü Ekle"}
                </h2>

                <p className="text-xs text-zinc-500 mt-1">
                  Bilgiler doğrudan Supabase veritabanına kaydedilir.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-500 hover:text-white"
              >
                <X size={17} />
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Ürün Adı *
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Örnek: Samsung 990 Pro 2TB"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Fiyat *
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                  placeholder="Örnek: 5200"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Kapasite
                </label>

                <input
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="Örnek: 2 TB"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Tür
                </label>

                <input
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                    })
                  }
                  placeholder="Örnek: NVMe M.2"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Okuma Hızı
                </label>

                <input
                  value={form.readSpeed}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      readSpeed: e.target.value,
                    })
                  }
                  placeholder="Örnek: 7450 MB/s"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Yazma Hızı
                </label>

                <input
                  value={form.writeSpeed}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      writeSpeed: e.target.value,
                    })
                  }
                  placeholder="Örnek: 6900 MB/s"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Arayüz
                </label>

                <input
                  value={form.interfaceType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      interfaceType: e.target.value,
                    })
                  }
                  placeholder="Örnek: PCIe 4.0 x4"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">

                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Açıklama
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Depolama ürünü hakkında kısa açıklama..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none resize-none focus:border-cyan-500"
                />

              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={closeForm}
                disabled={saving}
                className="px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 disabled:opacity-50"
              >
                İptal
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black disabled:opacity-50"
              >

                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}

                {saving
                  ? "Kaydediliyor..."
                  : editingId !== null
                  ? "Değişiklikleri Kaydet"
                  : "Depolama Ürününü Ekle"}

              </button>

            </div>

          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">

          <div className="p-5 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-sm font-black text-white">
                Kayıtlı Depolama Ürünleri
              </h2>

              <p className="text-xs text-zinc-500 mt-1">
                {loading
                  ? "Veritabanı okunuyor..."
                  : `Toplam ${items.length} ürün`}
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">

              <div className="relative w-full sm:w-[260px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Depolama ürünü ara..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="relative w-full sm:w-[220px]">
                <ArrowUpDown
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none"
                />

                <select
                  value={sortOption}
                  onChange={(e) =>
                    setSortOption(
                      e.target.value as SortOption
                    )
                  }
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-300 outline-none cursor-pointer hover:border-cyan-500/30 focus:border-cyan-500/50"
                >
                  <option value="name-asc">
                    Ada göre A → Z
                  </option>
                  <option value="name-desc">
                    Ada göre Z → A
                  </option>
                  <option value="price-asc">
                    Fiyat: Düşük → Yüksek
                  </option>
                  <option value="price-desc">
                    Fiyat: Yüksek → Düşük
                  </option>
                </select>
              </div>

            </div>

          </div>

          {loading ? (

            <div className="py-20 flex flex-col items-center">

              <Loader2
                size={30}
                className="animate-spin text-cyan-400 mb-4"
              />

              <p className="text-sm text-zinc-500">
                Supabase verileri yükleniyor...
              </p>

            </div>

          ) : filteredItems.length === 0 ? (

            <div className="py-20 text-center">

              <HardDrive
                size={30}
                className="mx-auto text-zinc-700 mb-3"
              />

              <p className="text-sm font-bold text-zinc-400">
                Depolama ürünü bulunamadı
              </p>

            </div>

          ) : (

            <div className="divide-y divide-zinc-800">

              {filteredItems.map((item) => (

                <div
                  key={item.id}
                  className="p-5 hover:bg-zinc-900/80 transition-colors"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                    <div className="w-11 h-11 shrink-0 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                      <HardDrive
                        size={20}
                        className="text-cyan-400"
                      />
                    </div>

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2 mb-2">

                        <h3 className="text-sm font-black text-white">
                          {item.name}
                        </h3>

                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {getSpec(item.specs, [
                            "Kapasite",
                            "kapasite",
                          ]) || "-"}
                        </span>

                      </div>

                      <p className="text-xs text-zinc-500">
                        {item.description || "Açıklama bulunmuyor."}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">

                        <span className="text-[10px] px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                          Tür: {getSpec(item.specs, [
                            "Tür",
                            "tür",
                            "Protokol",
                            "protokol",
                          ]) || "-"}
                        </span>

                        <span className="text-[10px] px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                          Okuma: {getSpec(item.specs, [
                            "Okuma",
                            "okuma",
                          ]) || "-"}
                        </span>

                        <span className="text-[10px] px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                          Yazma: {getSpec(item.specs, [
                            "Yazma",
                            "yazma",
                          ]) || "-"}
                        </span>

                        <span className="text-[10px] px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                          Arayüz: {getSpec(item.specs, [
                            "Arayüz",
                            "arayüz",
                          ]) || "-"}
                        </span>

                      </div>

                    </div>

                    <div className="lg:text-right">

                      <div className="text-lg font-black text-white mb-3">
                        {Number(item.price).toLocaleString("tr-TR")} ₺
                      </div>

                      <div className="flex gap-2">

                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-cyan-400"
                        >
                          <Pencil size={14} />
                          Düzenle
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                          Sil
                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}