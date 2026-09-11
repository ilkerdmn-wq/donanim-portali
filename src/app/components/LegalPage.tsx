import Link from "next/link";

type Section = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

export default function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <article className="rounded-3xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <header className="p-6 md:p-10 border-b border-zinc-800 bg-gradient-to-br from-cyan-500/10 via-zinc-900/20 to-transparent">
            <p className="text-[10px] font-black tracking-[0.16em] text-cyan-400 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              {intro}
            </p>
            <p className="mt-5 text-xs text-zinc-500">
              Son güncelleme: 12 Eylül 2026
            </p>
          </header>

          <div className="p-6 md:p-10 space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-black text-white">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-400">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.items && (
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400 list-disc pl-5 marker:text-cyan-400">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <footer className="p-6 md:px-10 border-t border-zinc-800 bg-zinc-950/30 text-sm text-zinc-400">
            Soruların veya taleplerin için <Link href="/iletisim" className="font-bold text-cyan-400 hover:text-cyan-300">iletişim formunu</Link> kullanabilirsin.
          </footer>
        </article>
      </div>
    </main>
  );
}
