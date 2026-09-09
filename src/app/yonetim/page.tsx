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
} from "lucide-react";

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

export default function ManagementPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1180px] mx-auto px-5 md:px-6 py-10 md:py-14">
        {/* BAŞLIK */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <ShieldCheck size={22} className="text-cyan-400" />
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

        {/* ÜST DURUM KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <Cpu size={18} className="text-cyan-400" />

              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400">
                DONANIM
              </span>
            </div>

            <p className="text-2xl font-black mt-5">6</p>

            <p className="text-xs text-zinc-500 mt-1">
              Aktif donanım kategorisi
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <Newspaper size={18} className="text-cyan-400" />

              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                HABERLER
              </span>
            </div>

            <p className="text-2xl font-black mt-5">Aktif</p>

            <p className="text-xs text-zinc-500 mt-1">
              Haber yönetim sistemi
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <ShieldCheck size={18} className="text-cyan-400" />

              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                AKTİF
              </span>
            </div>

            <p className="text-2xl font-black mt-5">Portal</p>

            <p className="text-xs text-zinc-500 mt-1">
              Yönetim sistemi hazır
            </p>
          </div>
        </div>

        {/* DONANIM YÖNETİMİ */}
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
            {hardwareCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      <Icon size={18} className="text-cyan-400" />
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                    />
                  </div>

                  <h3 className="text-sm font-black mt-5">
                    {card.title}
                  </h3>

                  <p className="text-xs text-zinc-600 leading-5 mt-2">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* İÇERİK VE SİSTEM */}
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
            {contentCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-cyan-500/30 hover:bg-zinc-900/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      <Icon size={18} className="text-cyan-400" />
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                    />
                  </div>

                  <h3 className="text-sm font-black mt-5">
                    {card.title}
                  </h3>

                  <p className="text-xs text-zinc-600 leading-5 mt-2">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}