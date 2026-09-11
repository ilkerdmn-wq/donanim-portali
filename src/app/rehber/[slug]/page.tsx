import type {
  Metadata,
} from "next";
import type {
  ReactNode,
} from "react";
import Link from "next/link";
import {
  notFound,
} from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Link2,
  Wrench,
} from "lucide-react";

type Guide = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
  cover_image_url: string;
  source_name: string;
  source_url: string;
  related_tool_label: string;
  related_tool_url: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const SITE_URL =
  "https://donanimportali.com";

async function getGuide(
  slug: string
): Promise<Guide | null> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  const url = new URL(
    `${supabaseUrl}/rest/v1/guides`
  );

  url.searchParams.set(
    "select",
    "*"
  );

  url.searchParams.set(
    "slug",
    `eq.${slug}`
  );

  url.searchParams.set(
    "published",
    "eq.true"
  );

  url.searchParams.set(
    "limit",
    "1"
  );

  try {
    const response =
      await fetch(
        url.toString(),
        {
          headers: {
            apikey: anonKey,
            Authorization:
              `Bearer ${anonKey}`,
          },
          cache: "no-store",
        }
      );

    if (!response.ok) {
      return null;
    }

    const rows =
      (await response.json()) as Guide[];

    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const guide =
    await getGuide(slug);

  if (!guide) {
    return {
      title:
        "Rehber Bulunamadı",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    guide.seo_title ||
    guide.title;

  const description =
    guide.seo_description ||
    guide.excerpt;

  const canonical =
    `${SITE_URL}/rehber/${encodeURIComponent(
      guide.slug
    )}`;

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type:
        "article",

      locale:
        "tr_TR",

      url:
        canonical,

      siteName:
        "Donanım Portalı",

      title,
      description,

      publishedTime:
        guide.created_at ||
        undefined,

      modifiedTime:
        guide.updated_at ||
        guide.created_at ||
        undefined,

      images:
        guide.cover_image_url
          ? [
              {
                url:
                  guide.cover_image_url,

                alt:
                  guide.title,
              },
            ]
          : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title,
      description,

      images:
        guide.cover_image_url
          ? [
              guide.cover_image_url,
            ]
          : undefined,
    },
  };
}

function renderInline(
  text: string
): ReactNode[] {
  const parts:
    | string[]
    | RegExpMatchArray[] = [];

  const tokens =
    text.split(
      /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
    );

  return tokens.map(
    (
      token,
      index
    ) => {
      if (
        token.startsWith("**") &&
        token.endsWith("**")
      ) {
        return (
          <strong
            key={index}
            className="font-black text-white"
          >
            {token.slice(2, -2)}
          </strong>
        );
      }

      if (
        token.startsWith("`") &&
        token.endsWith("`")
      ) {
        return (
          <code
            key={index}
            className="rounded-md border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-[0.9em] text-cyan-300"
          >
            {token.slice(1, -1)}
          </code>
        );
      }

      const linkMatch =
        token.match(
          /^\[([^\]]+)\]\(([^)]+)\)$/
        );

      if (linkMatch) {
        const [
          ,
          label,
          href,
        ] = linkMatch;

        const external =
          href.startsWith(
            "http://"
          ) ||
          href.startsWith(
            "https://"
          );

        if (external) {
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-cyan-400 underline decoration-cyan-500/30 underline-offset-4 hover:text-cyan-300"
            >
              {label}
            </a>
          );
        }

        return (
          <Link
            key={index}
            href={href}
            className="font-bold text-cyan-400 underline decoration-cyan-500/30 underline-offset-4 hover:text-cyan-300"
          >
            {label}
          </Link>
        );
      }

      return token;
    }
  );
}

function renderContent(
  content: string
) {
  const lines =
    content
      .replace(/\r\n/g, "\n")
      .split("\n");

  const elements:
    ReactNode[] = [];

  let bulletItems:
    string[] = [];

  let numberedItems:
    string[] = [];

  const flushBullets =
    () => {
      if (
        bulletItems.length ===
        0
      ) {
        return;
      }

      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="my-5 space-y-2.5 pl-5 list-disc marker:text-cyan-400"
        >
          {bulletItems.map(
            (
              item,
              index
            ) => (
              <li
                key={index}
                className="text-sm md:text-base leading-7 text-zinc-300"
              >
                {renderInline(
                  item
                )}
              </li>
            )
          )}
        </ul>
      );

      bulletItems = [];
    };

  const flushNumbers =
    () => {
      if (
        numberedItems.length ===
        0
      ) {
        return;
      }

      elements.push(
        <ol
          key={`ol-${elements.length}`}
          className="my-5 space-y-2.5 pl-5 list-decimal marker:font-black marker:text-cyan-400"
        >
          {numberedItems.map(
            (
              item,
              index
            ) => (
              <li
                key={index}
                className="text-sm md:text-base leading-7 text-zinc-300"
              >
                {renderInline(
                  item
                )}
              </li>
            )
          )}
        </ol>
      );

      numberedItems = [];
    };

  const flushLists =
    () => {
      flushBullets();
      flushNumbers();
    };

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    const rawLine =
      lines[i];

    const line =
      rawLine.trim();

    if (
      line.startsWith("- ")
    ) {
      flushNumbers();

      bulletItems.push(
        line.slice(2).trim()
      );

      continue;
    }

    if (
      /^\d+\.\s+/.test(
        line
      )
    ) {
      flushBullets();

      numberedItems.push(
        line.replace(
          /^\d+\.\s+/,
          ""
        )
      );

      continue;
    }

    flushLists();

    if (!line) {
      continue;
    }

    if (
      line === "---"
    ) {
      elements.push(
        <hr
          key={i}
          className="my-9 border-zinc-800"
        />
      );

      continue;
    }

    if (
      line.startsWith("### ")
    ) {
      elements.push(
        <h3
          key={i}
          className="mt-8 mb-3 text-xl md:text-2xl font-black text-white"
        >
          {renderInline(
            line.slice(4)
          )}
        </h3>
      );

      continue;
    }

    if (
      line.startsWith("## ")
    ) {
      elements.push(
        <div
          key={i}
          className="mt-10 mb-4"
        >
          <div className="mb-3 h-1 w-10 rounded-full bg-cyan-400" />

          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            {renderInline(
              line.slice(3)
            )}
          </h2>
        </div>
      );

      continue;
    }

    if (
      line.startsWith("# ")
    ) {
      elements.push(
        <h2
          key={i}
          className="mt-10 mb-4 text-3xl font-black text-white"
        >
          {renderInline(
            line.slice(2)
          )}
        </h2>
      );

      continue;
    }

    if (
      line.startsWith("> ")
    ) {
      elements.push(
        <blockquote
          key={i}
          className="my-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-4 text-sm md:text-base leading-7 text-cyan-100"
        >
          {renderInline(
            line.slice(2)
          )}
        </blockquote>
      );

      continue;
    }

    const nextLine =
      lines[i + 1]?.trim();

    if (
      line.includes("|") &&
      nextLine &&
      /^\|?[\s:-]+\|[\s|:-]+$/.test(
        nextLine
      )
    ) {
      const headerCells =
        line
          .replace(
            /^\||\|$/g,
            ""
          )
          .split("|")
          .map(
            (cell) =>
              cell.trim()
          );

      const rows:
        string[][] = [];

      i += 2;

      while (
        i < lines.length &&
        lines[i].includes("|")
      ) {
        rows.push(
          lines[i]
            .trim()
            .replace(
              /^\||\|$/g,
              ""
            )
            .split("|")
            .map(
              (cell) =>
                cell.trim()
            )
        );

        i++;
      }

      i--;

      elements.push(
        <div
          key={`table-${i}`}
          className="my-7 overflow-x-auto rounded-2xl border border-zinc-800"
        >
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-zinc-900">
              <tr>
                {headerCells.map(
                  (
                    cell,
                    index
                  ) => (
                    <th
                      key={index}
                      className="border-b border-zinc-800 px-4 py-3 text-xs font-black uppercase tracking-wide text-cyan-300"
                    >
                      {renderInline(
                        cell
                      )}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (
                  row,
                  rowIndex
                ) => (
                  <tr
                    key={
                      rowIndex
                    }
                    className="border-b border-zinc-800/70 last:border-b-0"
                  >
                    {row.map(
                      (
                        cell,
                        cellIndex
                      ) => (
                        <td
                          key={
                            cellIndex
                          }
                          className="px-4 py-3 text-sm leading-6 text-zinc-300"
                        >
                          {renderInline(
                            cell
                          )}
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );

      continue;
    }

    elements.push(
      <p
        key={i}
        className="my-4 text-sm md:text-base leading-8 text-zinc-300"
      >
        {renderInline(
          line
        )}
      </p>
    );
  }

  flushLists();

  return elements;
}

function isExternalUrl(
  value: string
) {
  return (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    )
  );
}

export default async function GuideDetailPage({
  params,
}: PageProps) {
  const {
    slug,
  } = await params;

  const guide =
    await getGuide(slug);

  if (!guide) {
    notFound();
  }

  const pageUrl =
    `${SITE_URL}/rehber/${guide.slug}`;

  const articleDescription =
    guide.seo_description ||
    guide.excerpt;

  const articleJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      guide.title,

    description:
      articleDescription,

    mainEntityOfPage:
      pageUrl,

    datePublished:
      guide.created_at,

    dateModified:
      guide.updated_at ||
      guide.created_at,

    inLanguage:
      "tr-TR",

    author: {
      "@type":
        "Organization",

      name:
        "Donanım Portalı",

      url:
        SITE_URL,
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "Donanım Portalı",

      url:
        SITE_URL,
    },

    image:
      guide.cover_image_url
        ? [
            guide.cover_image_url,
          ]
        : undefined,
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleJsonLd
            ),
        }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <Link
          href="/rehber"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-cyan-400 transition"
        >
          <ArrowLeft
            size={14}
          />
          Tüm Rehberler
        </Link>

        <header className="mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-black tracking-[0.14em] text-cyan-400 uppercase">
            <BookOpen
              size={13}
            />
            {guide.category ||
              "REHBER"}
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
            {guide.title}
          </h1>

          {guide.excerpt && (
            <p className="mt-5 text-base md:text-lg leading-8 text-zinc-400">
              {guide.excerpt}
            </p>
          )}
        </header>

        {guide.cover_image_url && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                guide.cover_image_url
              }
              alt={
                guide.title
              }
              className="aspect-video w-full object-cover"
            />
          </div>
        )}

        <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8 shadow-xl shadow-black/10">
          {renderContent(
            guide.content
          )}
        </section>

        {guide.related_tool_label &&
          guide.related_tool_url && (
            <section className="mt-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-zinc-900/40 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 shrink-0 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
                  <Wrench
                    size={19}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black tracking-[0.14em] text-cyan-400 uppercase">
                    İLGİLİ ARAÇ
                  </p>

                  <h2 className="mt-2 text-xl md:text-2xl font-black text-white">
                    Sistemine özel sonucu kontrol et
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Rehberdeki genel bilgiyi kendi sistem bileşenlerine göre değerlendirmek için ilgili Donanım Portalı aracını kullanabilirsin.
                  </p>

                  <Link
                    href={
                      guide.related_tool_url
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-zinc-950 hover:bg-cyan-300 transition"
                  >
                    {
                      guide.related_tool_label
                    }
                    <ArrowRight
                      size={15}
                    />
                  </Link>
                </div>
              </div>
            </section>
          )}

        {guide.source_name && (
          <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start gap-3">
              <Link2
                size={16}
                className="mt-0.5 shrink-0 text-cyan-400"
              />

              <div>
                <p className="text-xs font-black text-white">
                  Kaynak
                </p>

                {guide.source_url &&
                isExternalUrl(
                  guide.source_url
                ) ? (
                  <a
                    href={
                      guide.source_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    {
                      guide.source_name
                    }
                    <ExternalLink
                      size={13}
                    />
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-zinc-400">
                    {
                      guide.source_name
                    }
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
