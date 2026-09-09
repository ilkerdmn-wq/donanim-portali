"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Plus,
  Search,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Database,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type HardwareItem = {
  id: number;
  slug: string;
  category: string;
  name: string;
  price: number;
  description: string | null;
  specs: {
    Güç?: string;
    Sertifika?: string;
    Modüler?: string;
    "Form Faktörü"?: string;
  };
};

const emptyForm = {
  name: "",
  price: "",
  description: "",
  watt: "",
  efficiency: "",
  modular: "",
  formFactor: "",
};

export default function GucKaynaklariYonetimPage() {
  const [items, setItems] = useState<HardwareItem[]>([]);
  const [search, setSearch] = useState("");

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
      .eq("category", "guc-kaynaklari")
      .order("name", { ascending: true });

    if (error) {
      console.error("SUPABASE HATASI:", error);

      alert(
        "Güç kaynakları yüklenirken hata oluştu.\n\n" +
          error.message
      );

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
      name: item.name,
      price: String(item.price),
      description: item.description || "",
      watt: item.specs?.Güç || "",
      efficiency: item.specs?.Sertifika || "",
      modular: item.specs?.Modüler || "",
      formFactor: item.specs?.["Form Faktörü"] || "",
    });

    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Güç kaynağı adı boş bırakılamaz.");
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
      category: "guc-kaynaklari",
      name: form.name.trim(),
      price,
      description: form.description.trim(),
      specs: {
        Güç: form.watt.trim(),
        Sertifika: form.efficiency.trim(),
        Modüler: form.modular.trim(),
        "Form Faktörü": form.formFactor.trim(),
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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

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
              <Zap size={22} className="text-cyan-400" />
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
                Güç Kaynakları
              </h1>

              <p className="text-sm text-zinc-500 mt-1">
                Güç kaynaklarını veritabanından yönet.
              </p>

            </div>
          </div>

          <button
            onClick={openNewForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-black"
          >
            <Plus size={17} />
            Yeni Güç Kaynağı Ekle
          </button>

        </div>

        {showForm && (
          <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900/70 p-6 mb-8">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-lg font-black text-white">
                  {editingId !== null
                    ? "Güç Kaynağını Düzenle"
                    : "Yeni Güç Kaynağı Ekle"}
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
                  Güç Kaynağı Adı *
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Corsair RM850e 850W"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Fiyat *
                </label>

                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                  placeholder="5500"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Güç
                </label>

                <input
                  value={form.watt}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      watt: e.target.value,
                    })
                  }
                  placeholder="850 W"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Sertifika
                </label>

                <input
                  value={form.efficiency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      efficiency: e.target.value,
                    })
                  }
                  placeholder="80+ Gold"
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Modüler Yapı
                </label>

                <select
                  value={form.modular}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      modular: e.target.value,
                    })
                  }
                  className="w-full h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Tam Modüler">Tam Modüler</option>
                  <option value="Yarı Modüler">Yarı Modüler</option>
                  <option value="Modüler Değil">
                    Modüler Değil
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  Form Faktörü
                </label>

                <input
                  value={form.formFactor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      formFactor: e.target.value,
                    })
                  }
                  placeholder="ATX"
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
                  placeholder="Güç kaynağı hakkında açıklama..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none resize-none focus:border-cyan-500"
                />

              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={closeForm}
                disabled={saving}
                className="px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-400"
              >
                İptal
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 text-zinc-950 text-xs font-black disabled:opacity-50"
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
                  : "Güç Kaynağını Ekle"}

              </button>

            </div>

          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">

          <div className="p-5 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h2 className="text-sm font-black text-white">
                Kayıtlı Güç Kaynakları
              </h2>

              <p className="text-xs text-zinc-500 mt-1">
                {loading
                  ? "Veritabanı okunuyor..."
                  : `Toplam ${items.length} güç kaynağı`}
              </p>

            </div>

            <div className="relative w-full md:w-[300px]">

              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Güç kaynağı ara..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-white outline-none"
              />

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

              <Zap
                size={30}
                className="mx-auto text-zinc-700 mb-3"
              />

              <p className="text-sm font-bold text-zinc-400">
                Güç kaynağı bulunamadı
              </p>

            </div>

          ) : (

            <div className="divide-y divide-zinc-800">

              {filteredItems.map((item) => (

                <div
                  key={item.id}
                  className="p-5 hover:bg-zinc-900/80"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                    <div className="w-11 h-11 shrink-0 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                      <Zap
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
                          {item.specs?.Güç || "-"}
                        </span>

                      </div>

                      <p className="text-xs text-zinc-500">
                        {item.description || "Açıklama bulunmuyor."}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">

                        <span className="text-[10px] px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                          Sertifika: {item.specs?.Sertifika || "-"}
                        </span>

                        <span className="text-[10px] px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                          Modüler: {item.specs?.Modüler || "-"}
                        </span>

                        <span className="text-[10px] px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                          Form: {item.specs?.["Form Faktörü"] || "-"}
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