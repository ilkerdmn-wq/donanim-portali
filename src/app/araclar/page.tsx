import Link from "next/link";
import { Sparkles, Shuffle, Gauge, Gamepad2, Zap, Download, RefreshCw, Image as ImageIcon, FileText, ArrowRight } from "lucide-react";

const tools = [
  {
    title: "Otomatik PC önerisi",
    description: "Bütçene ve kullanım amacına göre optimize edilmiş sistemleri otomatik oluştur.",
    href: "/araclar/pc-oneri",
    icon: Sparkles,
  },
  {
    title: "PC toplama ve karşılaştırma",
    description: "Parçaları birleştirin, uyumluluğu ve toplam fiyatı test edin.",
    href: "/araclar/toplama",
    icon: Shuffle,
  },
  {
    title: "Darboğaz hesaplayıcı",
    description: "İşlemci ve ekran kartı arasındaki darboğaz oranını hesaplayın.",
    href: "/araclar/darbogaz",
    icon: Gauge,
  },
  {
    title: "Oyun FPS hesaplayıcı",
    description: "Donanımınızın oyunlarda vereceği tahmini FPS değerlerini görün.",
    href: "/araclar/fps",
    icon: Gamepad2,
  },
  {
    title: "PSU watt hesaplayıcı",
    description: "Sisteminiz için gereken güç kaynağı değerini hesaplayın.",
    href: "/araclar/psu",
    icon: Zap,
  },
  {
    title: "Steam indirme süresi",
    description: "İnternet hızınıza göre oyun indirme süresini hesaplayın.",
    href: "/araclar/steam",
    icon: Download,
  },
  {
    title: "Birim dönüştürücü",
    description: "Depolama ve frekans birimlerini birbirine dönüştürün.",
    href: "/araclar/birim",
    icon: RefreshCw,
  },
  {
    title: "Online Resim Dönüştürücü",
    description: "Görsellerinizi farklı formatlara anında dönüştürün.",
    href: "/araclar/resim",
    icon: ImageIcon,
  },
  {
    title: "Online Belge Dönüştürücü",
    description: "Notlarınızı ve metin belgelerinizi farklı formatlara aktarın.",
    href: "/araclar/belge",
    icon: FileText,
  },
];

export default function AraclarIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">🛠️</span> Donanım Araçları ve Hesaplayıcılar
        </h1>
        <p className="text-zinc-400 text-sm">Sistem toplama, performans testi ve dönüştürme araçlarına buradan ulaşın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-6 bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 rounded-3xl flex flex-col justify-between gap-4 group transition-all shadow-sm hover:shadow-cyan-500/5"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-cyan-400 group-hover:scale-105 transition-transform">
                  <Icon size={20} />
                </div>
                <ArrowRight size={16} className="text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{tool.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}