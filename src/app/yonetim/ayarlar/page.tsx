"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Settings,
  Save,
  RotateCcw,
  ShieldCheck,
  Eye,
  EyeOff,
  Bell,
  Globe2,
} from "lucide-react";

import {
  defaultSiteSettings,
  SiteSettings,
  useSiteSettings,
} from "../../components/SiteSettingsProvider";

export default function SiteSettingsPage() {
  const {
    settings: activeSettings,
    updateSettings,
    resetSettings,
    hydrated,
  } = useSiteSettings();

  const [
    settings,
    setSettings,
  ] =
    useState<SiteSettings>(
      defaultSiteSettings
    );

  const [
    saved,
    setSaved,
  ] =
    useState(false);

  useEffect(() => {
    if (hydrated) {
      setSettings(
        activeSettings
      );
    }
  }, [
    hydrated,
    activeSettings,
  ]);

  const updateSetting = <
    K extends keyof SiteSettings
  >(
    key: K,
    value: SiteSettings[K]
  ) => {
    setSettings(
      (prev) => ({
        ...prev,
        [key]: value,
      })
    );

    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(
      settings
    );

    setSaved(true);

    window.setTimeout(
      () => {
        setSaved(false);
      },
      2500
    );
  };

  const handleReset = () => {
    const confirmed =
      window.confirm(
        "Site ayarlarını varsayılan değerlere döndürmek istiyor musunuz?"
      );

    if (!confirmed) {
      return;
    }

    resetSettings();

    setSettings(
      defaultSiteSettings
    );

    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1000px] mx-auto px-5 md:px-6 py-10 md:py-14">
        <Link
          href="/yonetim"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft
            size={14}
          />
          Yönetim merkezine dön
        </Link>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Settings
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                SİTE AYARLARI
              </p>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">
                Portal Yapılandırması
              </h1>

              <p className="text-sm text-zinc-500 mt-2">
                Kaydettiğiniz genel ayarlar artık
                portal üzerinde anlık uygulanır.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold">
            <ShieldCheck
              size={14}
            />
            Aktif
          </div>
        </div>

        {saved && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
            Site ayarları kaydedildi ve aktif edildi.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Globe2
                size={17}
                className="text-cyan-400"
              />

              <h2 className="text-base font-black">
                Genel Bilgiler
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">
                  Site Adı
                </label>

                <input
                  value={
                    settings.siteName
                  }
                  onChange={(
                    e
                  ) =>
                    updateSetting(
                      "siteName",
                      e.target.value
                    )
                  }
                  className="h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">
                  Site Sloganı
                </label>

                <input
                  value={
                    settings.siteSlogan
                  }
                  onChange={(
                    e
                  ) =>
                    updateSetting(
                      "siteSlogan",
                      e.target.value
                    )
                  }
                  className="h-11 px-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell
                size={17}
                className="text-cyan-400"
              />

              <h2 className="text-base font-black">
                Duyuru
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <textarea
                value={
                  settings.announcement
                }
                onChange={(
                  e
                ) =>
                  updateSetting(
                    "announcement",
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Portalda gösterilecek duyuruyu yazın..."
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-sm text-white outline-none resize-none focus:border-cyan-500/50"
              />

              <SettingToggle
                title="Duyuruyu Göster"
                description="Aktif olduğunda duyuru üst menünün altında gösterilir."
                checked={
                  settings.showAnnouncement
                }
                onChange={(
                  value
                ) =>
                  updateSetting(
                    "showAnnouncement",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Eye
                size={17}
                className="text-cyan-400"
              />

              <h2 className="text-base font-black">
                Görünüm ve Veri
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-zinc-800">
              <SettingToggle
                title="Ürün Fiyatlarını Göster"
                description="Donanım sayfalarında fiyatların gösterilip gösterilmeyeceğini belirler."
                checked={
                  settings.showPrices
                }
                onChange={(
                  value
                ) =>
                  updateSetting(
                    "showPrices",
                    value
                  )
                }
              />

              <SettingToggle
                title="Fiyat Kaynağını Göster"
                description="Ürünlerde fiyat kaynağının gösterilip gösterilmeyeceğini belirler."
                checked={
                  settings.showPriceSource
                }
                onChange={(
                  value
                ) =>
                  updateSetting(
                    "showPriceSource",
                    value
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.03] p-6">
            <div className="flex items-center gap-2 mb-5">
              <EyeOff
                size={17}
                className="text-red-400"
              />

              <h2 className="text-base font-black">
                Sistem Durumu
              </h2>
            </div>

            <SettingToggle
              title="Bakım Modu"
              description="Aktif olduğunda ziyaretçiler bakım ekranını görür; yönetim paneli açık kalır."
              checked={
                settings.maintenanceMode
              }
              danger
              onChange={(
                value
              ) =>
                updateSetting(
                  "maintenanceMode",
                  value
                )
              }
            />
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              onClick={
                handleReset
              }
              className="h-11 px-5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-sm font-bold flex items-center justify-center gap-2"
            >
              <RotateCcw
                size={15}
              />
              Varsayılanlara Dön
            </button>

            <button
              onClick={
                handleSave
              }
              className="h-11 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 transition-all text-sm font-black flex items-center justify-center gap-2"
            >
              <Save
                size={15}
              />
              Ayarları Kaydet
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-[11px] leading-5 text-cyan-100/80">
          Site adı, slogan, duyuru ve bakım modu
          artık doğrudan çalışır. Fiyat gösterme ve
          fiyat kaynağı seçeneklerini de donanım
          kartlarına bağlamak için donanım kategori
          sayfası bu ortak ayarları okuyabilir.
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onChange,
  danger = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
  danger?: boolean;
}) {
  return (
    <div className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-5">
      <div>
        <p className="text-sm font-bold text-white">
          {title}
        </p>

        <p className="text-xs text-zinc-500 mt-1 leading-5">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`relative w-12 h-7 rounded-full shrink-0 transition-all ${
          checked
            ? danger
              ? "bg-red-500"
              : "bg-cyan-500"
            : "bg-zinc-800"
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
