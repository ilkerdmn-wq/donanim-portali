"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Cpu,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
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
  updated_at?: string | null;
};

type FormState = {
  name: string;
  slug: string;
  price: string;
  description: string;
  socket: string;
  cores: string;
  threads: string;
  baseClock: string;
  boostClock: string;
  tdp: string;
};

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

const emptyForm: FormState = {
  name: "",
  slug: "",
  price: "",
  description: "",
  socket: "",
  cores: "",
  threads: "",
  baseClock: "",
  boostClock: "",
  tdp: "",
};

function createSlug(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSpec(
  specs: Record<string, any> | null | undefined,
  keys: string[]
) {
  if (!specs) {
    return "";
  }

  for (const key of keys) {
    if (
      specs[key] !== undefined &&
      specs[key] !== null &&
      String(specs[key]).trim() !== ""
    ) {
      return String(specs[key]);
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

export default function ProcessorManagementPage() {
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] =
    useState<SortOption>("name-asc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<HardwareItem | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const loadItems = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("hardware_items")
        .select("*")
        .eq("category", "islemciler")
        .order("name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setItems((data || []) as HardwareItem[]);
    } catch (error: any) {
      console.error("İŞLEMCİ YÜKLEME HATASI:", error);

      alert(
        "İşlemciler yüklenemedi.\n\n" +
          (error?.message || JSON.stringify(error))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search
      .trim()
      .toLocaleLowerCase("tr-TR");

    const filtered = !q
      ? [...items]
      : items.filter((item) => {
          const socket = getSpec(item.specs, [
            "Soket",
            "soket",
          ]);

          const cores = getSpec(item.specs, [
            "Çekirdek",
            "çekirdek",
            "Cores",
            "cores",
          ]);

          return (
            item.name
              .toLocaleLowerCase("tr-TR")
              .includes(q) ||
            socket
              .toLocaleLowerCase("tr-TR")
              .includes(q) ||
            cores
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

  const openNewModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (item: HardwareItem) => {
    setEditingItem(item);

    setForm({
      name: item.name || "",
      slug: item.slug || "",
      price: String(item.price || ""),
      description: item.description || "",

      socket: getSpec(item.specs, [
        "Soket",
        "soket",
      ]),

      cores: getSpec(item.specs, [
        "Çekirdek",
        "çekirdek",
        "Cores",
        "cores",
      ]),

      threads: getSpec(item.specs, [
        "İş Parçacığı",
        "iş parçacığı",
        "Thread",
        "Threads",
        "thread",
        "threads",
      ]),

      baseClock: getSpec(item.specs, [
        "Temel Frekans",
        "temel frekans",
        "Base Clock",
        "base clock",
      ]),

      boostClock: getSpec(item.specs, [
        "Boost Frekans",
        "boost frekans",
        "Boost Clock",
        "boost clock",
      ]),

      tdp: getSpec(item.specs, [
        "TDP",
        "tdp",
      ]),
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug:
        editingItem && prev.slug
          ? prev.slug
          : createSlug(value),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("İşlemci adı zorunlu.");
      return;
    }

    if (!form.price.trim()) {
      alert("Fiyat zorunlu.");
      return;
    }

    const price = Number(
      form.price
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    );

    if (!Number.isFinite(price)) {
      alert("Geçerli bir fiyat gir.");
      return;
    }

    const slug =
      form.slug.trim() || createSlug(form.name);

    const specs = {
      Soket: form.socket.trim(),
      Çekirdek: form.cores.trim(),
      "İş Parçacığı": form.threads.trim(),
      "Temel Frekans": form.baseClock.trim(),
      "Boost Frekans": form.boostClock.trim(),
      TDP: form.tdp.trim(),
    };

    setSaving(true);

    try {
      if (editingItem) {
        const { error } = await supabase
          .from("hardware_items")
          .update({
            name: form.name.trim(),
            slug,
            category: "islemciler",
            price,
            description: form.description.trim(),
            specs,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("hardware_items")
          .insert({
            name: form.name.trim(),
            slug,
            category: "islemciler",
            price,
            description: form.description.trim(),
            specs,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          throw error;
        }
      }

      closeModal();
      await loadItems();
    } catch (error: any) {
      console.error("İŞLEMCİ KAYDETME HATASI:", error);

      alert(
        "İşlemci kaydedilemedi.\n\n" +
          (error?.message || JSON.stringify(error))
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: HardwareItem) => {
    const confirmed = window.confirm(
      `"${item.name}" işlemcisini silmek istediğine emin misin?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("hardware_items")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      setItems((prev) =>
        prev.filter((x) => x.id !== item.id)
      );
    } catch (error: any) {
      console.error("İŞLEMCİ SİLME HATASI:", error);

      alert(
        "İşlemci silinemedi.\n\n" +
          (error?.message || JSON.stringify(error))
      );
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1180px] mx-auto px-5 md:px-6 py-10 md:py-14">

        <Link
          href="/yonetim"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Yönetim paneline dön
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Cpu
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                DONANIM YÖNETİMİ
              </p>

              <h1 className="text-3xl font-black tracking-tight mt-1">
                İşlemciler
              </h1>

              <p className="text-sm text-zinc-500 mt-1">
                İşlemci ekle, düzenle ve mevcut işlemcileri yönet.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-black transition-colors"
          >
            <Plus size={17} />
            Yeni İşlemci Ekle
          </button>
        </div>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-zinc-800">

            <div>
              <h2 className="text-sm font-black">
                Kayıtlı İşlemciler
              </h2>

              <p className="text-[11px] text-zinc-500 mt-1">
                Toplam {items.length} işlemci
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
                  placeholder="İşlemci ara..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500/50"
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
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-300 outline-none cursor-pointer hover:border-cyan-500/30 focus:border-cyan-500/50"
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
            <div className="min-h-[220px] flex flex-col items-center justify-center">
              <Loader2
                size={26}
                className="animate-spin text-cyan-400"
              />

              <p className="text-xs text-zinc-500 mt-3">
                Supabase verileri yükleniyor...
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="min-h-[220px] flex items-center justify-center">
              <p className="text-sm text-zinc-500">
                İşlemci bulunamadı.
              </p>
            </div>
          ) : (
            <div>
              {filteredItems.map((item) => {
                const socket = getSpec(item.specs, [
                  "Soket",
                  "soket",
                ]);

                const cores = getSpec(item.specs, [
                  "Çekirdek",
                  "çekirdek",
                  "Cores",
                  "cores",
                ]);

                const threads = getSpec(item.specs, [
                  "İş Parçacığı",
                  "iş parçacığı",
                  "Thread",
                  "Threads",
                  "thread",
                  "threads",
                ]);

                const baseClock = getSpec(item.specs, [
                  "Temel Frekans",
                  "temel frekans",
                  "Base Clock",
                  "base clock",
                ]);

                const boostClock = getSpec(item.specs, [
                  "Boost Frekans",
                  "boost frekans",
                  "Boost Clock",
                  "boost clock",
                ]);

                const tdp = getSpec(item.specs, [
                  "TDP",
                  "tdp",
                ]);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 border-b border-zinc-800 last:border-b-0"
                  >
                    <div className="flex gap-4 min-w-0">

                      <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                        <Cpu
                          size={18}
                          className="text-cyan-400"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-sm font-black">
                            {item.name}
                          </h3>

                          {socket && (
                            <span className="px-2 py-0.5 rounded-md border border-cyan-900/60 bg-cyan-950/30 text-[9px] text-cyan-400 font-black">
                              {socket}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-500 mt-2 line-clamp-1">
                          {item.description ||
                            "Açıklama eklenmemiş."}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">

                          {cores && (
                            <span className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-950 text-[9px] text-zinc-400">
                              Çekirdek: {cores}
                            </span>
                          )}

                          {threads && (
                            <span className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-950 text-[9px] text-zinc-400">
                              İş Parçacığı: {threads}
                            </span>
                          )}

                          {baseClock && (
                            <span className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-950 text-[9px] text-zinc-400">
                              Temel: {baseClock}
                            </span>
                          )}

                          {boostClock && (
                            <span className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-950 text-[9px] text-zinc-400">
                              Boost: {boostClock}
                            </span>
                          )}

                          {tdp && (
                            <span className="px-2 py-1 rounded-md border border-zinc-800 bg-zinc-950 text-[9px] text-zinc-400">
                              TDP: {tdp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end gap-3 shrink-0">

                      <p className="text-lg font-black">
                        {Number(
                          item.price || 0
                        ).toLocaleString("tr-TR")}{" "}
                        ₺
                      </p>

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(item)
                          }
                          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                        >
                          <Pencil size={13} />
                          Düzenle
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(item)
                          }
                          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-red-400 hover:border-red-900 transition-colors"
                        >
                          <Trash2 size={13} />
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-zinc-950 border-b border-zinc-800">

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  {editingItem
                    ? "İŞLEMCİ DÜZENLE"
                    : "YENİ İŞLEMCİ"}
                </p>

                <h2 className="text-xl font-black mt-1">
                  {editingItem
                    ? editingItem.name
                    : "Yeni İşlemci Ekle"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-10 h-10 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  İşlemci Adı
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    handleNameChange(e.target.value)
                  }
                  placeholder="Örn: AMD Ryzen 7 7800X3D"
                  className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Slug
                </label>

                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Açıklama
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description:
                        e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full mt-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none resize-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Fiyat
                  </label>

                  <input
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="7500"
                    className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Soket
                  </label>

                  <input
                    value={form.socket}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        socket: e.target.value,
                      }))
                    }
                    placeholder="AM5"
                    className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Çekirdek
                  </label>

                  <input
                    value={form.cores}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        cores: e.target.value,
                      }))
                    }
                    placeholder="8"
                    className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    İş Parçacığı
                  </label>

                  <input
                    value={form.threads}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        threads: e.target.value,
                      }))
                    }
                    placeholder="16"
                    className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Temel Frekans
                  </label>

                  <input
                    value={form.baseClock}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        baseClock: e.target.value,
                      }))
                    }
                    placeholder="4.2 GHz"
                    className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Boost Frekans
                  </label>

                  <input
                    value={form.boostClock}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        boostClock: e.target.value,
                      }))
                    }
                    placeholder="5.0 GHz"
                    className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    TDP
                  </label>

                  <input
                    value={form.tdp}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        tdp: e.target.value,
                      }))
                    }
                    placeholder="120W"
                    className="w-full h-12 mt-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-black text-sm inline-flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingItem
                      ? "Değişiklikleri Kaydet"
                      : "İşlemciyi Kaydet"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}