"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Download, Upload } from "lucide-react";
import ToolGuide from "@/app/components/ToolGuide";

export default function ResimDonusturucuPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [format, setFormat] = useState<string>("image/jpeg");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.substring(0, file.name.lastIndexOf(".")));
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setConvertedUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConvert = () => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(format, 0.9);
        setConvertedUrl(dataUrl);
      }
    };
  };

  const getExtension = () => {
    if (format === "image/jpeg") return "jpg";
    if (format === "image/png") return "png";
    return "webp";
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/araclar" className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2">
          <ArrowLeft size={14} /> Araçlara dön
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">🖼️</span> Online Resim Dönüştürücü
        </h1>
        <p className="text-zinc-400 text-sm">Görsellerinizi anında PNG, JPG veya WebP formatına dönüştürün.</p>
      </div>

      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm">
        {!imageSrc ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer bg-zinc-950 transition-all"
          >
            <div className="p-4 bg-zinc-900 rounded-2xl text-cyan-400">
              <Upload size={28} />
            </div>
            <span className="text-sm font-bold text-white">Görsel seçmek için tıklayın</span>
            <span className="text-xs text-zinc-500">PNG, JPG, WebP desteklenir</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-900 rounded-xl text-cyan-400">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{fileName}</h4>
                  <span className="text-[11px] text-zinc-500">Görsel başarıyla yüklendi</span>
                </div>
              </div>
              <button 
                onClick={() => setImageSrc(null)}
                className="text-xs text-red-400 hover:underline font-semibold"
              >
                Yeni Görsel Seç
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400">Hedef Format</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "image/jpeg", label: "JPG" },
                  { id: "image/png", label: "PNG" },
                  { id: "image/webp", label: "WebP" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormat(item.id)}
                    className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                      format === item.id ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConvert}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-zinc-950 font-bold rounded-2xl transition-all shadow-lg text-sm"
            >
              Dönüştür
            </button>

            {convertedUrl && (
              <div className="p-6 bg-zinc-950 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                <span className="text-xs text-emerald-400 font-bold">Dönüştürme tamamlandı!</span>
                <a
                  href={convertedUrl}
                  download={`${fileName}.${getExtension()}`}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Download size={14} /> İndir ({getExtension().toUpperCase()})
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      <ToolGuide tool="resim" />
    </div>
  );
}
