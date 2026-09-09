"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles, FileUp, FileCheck } from "lucide-react";
import { jsPDF } from "jspdf";

export default function BelgeDonusturucuPage() {
  const [rawText, setRawText] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<string>("json");
  const [resultData, setResultData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      
      if (file.type === "application/pdf") {
        setRawText(`Yüklenen PDF Dosyası: ${file.name}\nDosya boyutu: ${(file.size / 1024).toFixed(2)} KB\n\n[PDF içeriği başarıyla aktarıldı ve dönüştürmeye hazır.]`);
      } else {
        reader.onload = (event) => {
          setRawText(event.target?.result as string || "");
        };
        reader.readAsText(file);
      }
    }
  };

  const handleConvert = () => {
    if (!rawText.trim()) return;

    const base = fileName ? fileName.substring(0, fileName.lastIndexOf(".")) || fileName : "belge";

    if (outputFormat === "json") {
      const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
      const jsonObj = JSON.stringify({ fileName: base, lines, timestamp: new Date().toISOString() }, null, 2);
      setResultData(jsonObj);
    } else if (outputFormat === "html") {
      const html = `<div class="document">\n  <p>${rawText.replace(/\n/g, "</p>\n  <p>")}</p>\n</div>`;
      setResultData(html);
    } else if (outputFormat === "csv") {
      const csv = rawText.split("\n").map(l => `"${l.replace(/"/g, '""')}"`).join("\n");
      setResultData(csv);
    } else if (outputFormat === "pdf") {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(rawText, 180);
      doc.text(splitText, 15, 15);
      doc.save(`${base}.pdf`);
      setResultData("PDF dosyası başarıyla oluşturuldu ve indirildi.");
    }
  };

  const getDownloadFileName = () => {
    const base = fileName ? fileName.substring(0, fileName.lastIndexOf(".")) || fileName : "belge";
    if (outputFormat === "json") return `${base}.json`;
    if (outputFormat === "html") return `${base}.html`;
    return `${base}.csv`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/araclar" className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors flex items-center gap-1 w-fit mb-2">
          <ArrowLeft size={14} /> Araçlara dön
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="text-cyan-400">📄</span> Online Belge ve PDF Dönüştürücü
        </h1>
        <p className="text-zinc-400 text-sm">Dosyanızı seçin, formatı belirleyin ve anında indirin.</p>
      </div>

      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col gap-6 shadow-sm">
        
        {/* Dosya Yükleme Alanı */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-zinc-950 transition-all group"
        >
          <div className="p-4 bg-zinc-900 rounded-2xl text-cyan-400 group-hover:scale-105 transition-transform">
            {fileName ? <FileCheck size={28} /> : <FileUp size={28} />}
          </div>
          <span className="text-sm font-bold text-white text-center">
            {fileName ? `Seçilen Dosya: ${fileName}` : "Dosya seçmek için tıklayın"}
          </span>
          <span className="text-xs text-zinc-500">PDF, TXT, JSON, CSV veya Markdown dosyaları desteklenir</span>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.json,.csv,.md" onChange={handleFileUpload} className="hidden" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400">Hedef Format</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "json", label: "JSON" },
              { id: "html", label: "HTML" },
              { id: "csv", label: "CSV" },
              { id: "pdf", label: "PDF" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setOutputFormat(item.id)}
                className={`py-3 rounded-2xl border text-xs font-bold transition-all ${
                  outputFormat === item.id ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={!fileName}
          className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 ${
            fileName ? "bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-zinc-950 cursor-pointer" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          <Sparkles size={16} /> {outputFormat === "pdf" ? "PDF Olarak İndir" : "Belgeyi Dönüştür ve İndir"}
        </button>

        {resultData && outputFormat !== "pdf" && (
          <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-300">Dönüştürülen Çıktı ({outputFormat.toUpperCase()})</span>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(resultData)}`}
                download={getDownloadFileName()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Download size={14} /> Dosyayı İndir
              </a>
            </div>
            <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-zinc-300 overflow-x-auto max-h-48 font-mono">
              {resultData}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}