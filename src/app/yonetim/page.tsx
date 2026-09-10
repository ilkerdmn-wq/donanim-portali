"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Cpu,
  Monitor,
  Layout,
  Database,
  Zap,
  HardDrive,
  Newspaper,
  Settings,
  ArrowRight,
  ShieldCheck,
  Loader2,
  PackageSearch,
  AlertTriangle,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useSiteSettings } from "../components/SiteSettingsProvider";

const hardwareCards = [
  {
    title: "İşlemciler",
    description: "CPU ekle, düzenle ve mevcut işlemcileri yönet.",
    href: "/yonetim/donanim/islemciler",
    icon: Cpu,
  },
  {
    title: "Ekran Kartları",
    description: "GPU modellerini, fiyatlarını ve özelliklerini yönet.",
    href: "/yonetim/donanim/ekran-kartlari",
    icon: Monitor,
  },
  {
    title: "Anakartlar",
    description: "Anakart modellerini ve teknik özelliklerini yönet.",
    href: "/yonetim/donanim/anakartlar",
    icon: Layout,
  },
  {
    title: "Bellekler",
    description: "RAM modellerini, hız ve kapasite bilgilerini yönet.",
    href: "/yonetim/donanim/bellekler",
    icon: Database,
  },
  {
    title: "Güç Kaynakları",
    description: "PSU modellerini ve watt bilgilerini yönet.",
    href: "/yonetim/donanim/guc-kaynaklari",
    icon: Zap,
  },
  {
    title: "Depolama",
    description: "SSD ve diğer depolama ürünlerini yönet.",
    href: "/yonetim/donanim/depolama",
    icon: HardDrive,
  },
];

const contentCards = [
  {
    title: "Haber Yönetimi",
    description: "Yeni haber ekle, mevcut haberleri düzenle ve yayınla.",
    href: "/yonetim/haberler",
    icon: Newspaper,
  },
  {
    title: "Toplu Veri Yönetimi",
    description: "Donanım verilerini merkezi olarak kontrol et.",
    href: "/yonetim/toplu-veri",
    icon: Database,
  },
  {
    title: "Site Ayarları",
    description: "Portalın genel ayarlarını ve yapılandırmasını yönet.",
    href: "/yonetim/ayarlar",
    icon: Settings,
  },
];

const hardwareCategories = [
  "islemciler",
  "ekran-kartlari",
  "anakartlar",
  "bellekler",
  "guc-kaynaklari",
  "depolama",
];

type DashboardStats = {
  totalHardware: number;
  activeCategories: number;
  validPrice: number;
  invalidPrice: number;
};

export default function ManagementPage() {
  const { settings, hydrated } =
    useSiteSettings();

  const [
    stats,
    setStats,
  ] =
    useState<DashboardStats>({
      totalHardware: 0,
      activeCategories: 0,
      validPrice: 0,
      invalidPrice: 0,
    });

  const [
    loadingStats,
    setLoadingStats,
  ] =
    useState(true);

  const [
    statsError,
    setStatsError,
  ] =
    useState("");

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats =
    async () => {
      setLoadingStats(true);
      setStatsError("");

      try {
        const {
          data,
          error,
        } = await supabase
          .from(
            "hardware_items_with_price"
          )
          .select(
            "id,category,current_price,has_valid_price"
          );

        if (error) {
          throw error;
        }

        const items =
          data || [];

        const categorySet =
          new Set<string>();

        let validPrice = 0;
        let invalidPrice = 0;

        for (
          const item of items
        ) {
          if (
            hardwareCategories.includes(
              item.category
            )
          ) {
            categorySet.add(
              item.category
            );
          }

          if (
            item.has_valid_price ===
              true &&
            item.current_price !==
              null
          ) {
            validPrice++;
          } else {
            invalidPrice++;
          }
        }

        setStats({
          totalHardware:
            items.length,
          activeCategories:
            categorySet.size,
          validPrice,
          invalidPrice,
        });
      } catch (
        error: any
      ) {
        console.error(
          "Yönetim paneli istatistik hatası:",
          error
        );

        setStatsError(
          error?.message ||
            "İstatistikler yüklenemedi."
        );
      } finally {
        setLoadingStats(
          false
        );
      }
    };

  const portalStatus =
    hydrated &&
    settings.maintenanceMode
      ? "Bakım Modu"
      : "Aktif";

  const portalStatusClass =
    hydrated &&
    settings.maintenanceMode
      ? "text-amber-400"
      : "text-emerald-400";

  const portalDescription =
    hydrated &&
    settings.maintenanceMode
      ? "Ziyaretçi tarafı bakım modunda"
      : "Portal ziyaretçilere açık";

  const priceHealthText =
    useMemo(() => {
      if (
        loadingStats
      ) {
        return "Kontrol ediliyor";
      }

      if (
        stats.totalHardware ===
        0
      ) {
        return "Veri yok";
      }

      return `${stats.validPrice} geçerli / ${stats.invalidPrice} bekleyen`;
    }, [
      loadingStats,
      stats,
    ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1180px] mx-auto px-5 md:px-6 py-10 md:py-14">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ShieldCheck
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                YÖNETİM MERKEZİ
              </p>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">
                Donanım Portalı Yönetimi
              </h1>
            </div>
          </div>

          <p className="text-sm text-zinc-500 mt-3">
            Donanım ürünlerini, haberleri ve portal verilerini tek merkezden yönet.
          </p>
        </div>

        {statsError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center gap-3">
            <AlertTriangle
              size={16}
              className="text-red-400"
            />

            <p className="text-xs text-red-300">
              {statsError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <Cpu
                size={18}
                className="text-cyan-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400">
                DONANIM
              </span>
            </div>

            <div className="mt-5">
              {loadingStats ? (
                <Loader2
                  size={22}
                  className="animate-spin text-cyan-400"
                />
              ) : (
                <p className="text-2xl font-black">
                  {stats.activeCategories}
                </p>
              )}
            </div>

            <p className="text-xs text-zinc-500 mt-1">
              Aktif donanım kategorisi
            </p>

            <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600">
              <PackageSearch
                size={12}
              />
              {loadingStats
                ? "Ürünler sayılıyor"
                : `${stats.totalHardware.toLocaleString("tr-TR")} toplam ürün`}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <Newspaper
                size={18}
                className="text-cyan-400"
              />

              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                FİYAT SİSTEMİ
              </span>
            </div>

            <p className="text-2xl font-black mt-5">
              {loadingStats
                ? "..."
                : stats.validPrice >
                  0
                ? "Aktif"
                : "Kontrol"}
            </p>

            <p className="text-xs text-zinc-500 mt-1">
              Güncel fiyat doğrulama sistemi
            </p>

            <p className="text-[10px] text-zinc-600 mt-3">
              {priceHealthText}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <ShieldCheck
                size={18}
                className="text-cyan-400"
              />

              <span
                className={`text-[9px] font-black uppercase tracking-wider ${portalStatusClass}`}
              >
                {portalStatus.toUpperCase()}
              </span>
            </div>

            <p
              className={`text-2xl font-black mt-5 ${portalStatusClass}`}
            >
              {portalStatus}
            </p>

            <p className="text-xs text-zinc-500 mt-1">
              {portalDescription}
            </p>

            <p className="text-[10px] text-zinc-600 mt-3">
              Site adı:{" "}
              <span className="text-zinc-400">
                {settings.siteName}
              </span>
            </p>
          </div>
        </div>

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-black">
              Donanım Yönetimi
            </h2>

            <p className="text-xs text-zinc-500 mt-1">
              Portalda gösterilen donanım ürünlerini yönetin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hardwareCards.map(
              (
                card
              ) => {
                const Icon =
                  card.icon;

                return (
                  <Link
                    key={
                      card.href
                    }
                    href={
                      card.href
                    }
                    className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                        <Icon
                          size={18}
                          className="text-cyan-400"
                        />
                      </div>

                      <ArrowRight
                        size={16}
                        className="text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>

                    <h3 className="text-sm font-black mt-5">
                      {
                        card.title
                      }
                    </h3>

                    <p className="text-xs text-zinc-600 leading-5 mt-2">
                      {
                        card.description
                      }
                    </p>
                  </Link>
                );
              }
            )}
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-black">
              İçerik ve Sistem
            </h2>

            <p className="text-xs text-zinc-500 mt-1">
              Haber, veri ve genel portal ayarlarını yönetin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentCards.map(
              (
                card
              ) => {
                const Icon =
                  card.icon;

                return (
                  <Link
                    key={
                      card.href
                    }
                    href={
                      card.href
                    }
                    className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                        <Icon
                          size={18}
                          className="text-cyan-400"
                        />
                      </div>

                      <ArrowRight
                        size={16}
                        className="text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>

                    <h3 className="text-sm font-black mt-5">
                      {
                        card.title
                      }
                    </h3>

                    <p className="text-xs text-zinc-600 leading-5 mt-2">
                      {
                        card.description
                      }
                    </p>
                  </Link>
                );
              }
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
