import {
  SPEC_FIELDS,
  imageUrl,
  type ReviewBlock,
} from "@/app/lib/reviews";

export function ReviewSpecs({
  specs,
}: {
  specs: Record<
    string,
    string
  >;
}) {
  const fields =
    SPEC_FIELDS.filter(
      ([key]) => specs[key]
    );

  if (!fields.length) {
    return null;
  }

  return (
    <section className="my-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-black mb-4">
        Hızlı Teknik Özellikler
      </h2>

      <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {fields.map(
          ([key, label]) => (
            <div
              key={key}
              className="min-w-0"
            >
              <dt className="text-xs text-cyan-400">
                {label}
              </dt>

              <dd className="mt-2 text-sm text-zinc-200 break-words">
                {specs[key]}
              </dd>
            </div>
          )
        )}
      </dl>
    </section>
  );
}

function sourceLabel(
  value: string
) {
  try {
    const url =
      new URL(value);

    const host =
      url.hostname
        .toLowerCase()
        .replace(/^www\./, "");

    if (
      host ===
        "news.acer.com" ||
      host.endsWith(
        ".news.acer.com"
      )
    ) {
      return "Acer Haber Merkezi";
    }

    if (
      host === "acer.com" ||
      host.endsWith(
        ".acer.com"
      )
    ) {
      return "Acer Resmi Ürün Sayfası";
    }

    if (
      host === "lenovo.com" ||
      host.endsWith(
        ".lenovo.com"
      )
    ) {
      return "Lenovo Resmi Ürün Sayfası";
    }

    if (
      host === "hp.com" ||
      host.endsWith(".hp.com")
    ) {
      return "HP Resmi Ürün Sayfası";
    }

    if (
      host === "asus.com" ||
      host.endsWith(
        ".asus.com"
      )
    ) {
      return "ASUS Resmi Ürün Sayfası";
    }

    if (
      host === "msi.com" ||
      host.endsWith(".msi.com")
    ) {
      return "MSI Resmi Ürün Sayfası";
    }

    if (
      host === "intel.com" ||
      host.endsWith(
        ".intel.com"
      )
    ) {
      return "Intel Resmi Ürün Sayfası";
    }

    if (
      host === "nvidia.com" ||
      host.endsWith(
        ".nvidia.com"
      )
    ) {
      return "NVIDIA Resmi Sayfası";
    }

    if (
      host === "amd.com" ||
      host.endsWith(".amd.com")
    ) {
      return "AMD Resmi Sayfası";
    }

    if (
      host === "gigabyte.com" ||
      host.endsWith(
        ".gigabyte.com"
      )
    ) {
      return "Gigabyte Resmi Ürün Sayfası";
    }

    if (
      host === "dell.com" ||
      host.endsWith(
        ".dell.com"
      )
    ) {
      return "Dell Resmi Ürün Sayfası";
    }

    if (
      host === "samsung.com" ||
      host.endsWith(
        ".samsung.com"
      )
    ) {
      return "Samsung Resmi Ürün Sayfası";
    }

    return host;
  } catch {
    return value;
  }
}

function SourceBlock({
  value,
}: {
  value: string;
}) {
  const sources =
    value
      .split("\n")
      .map((source) =>
        source.trim()
      )
      .filter(Boolean)
      .filter(
        (source) =>
          Boolean(
            imageUrl(source)
          )
      );

  if (!sources.length) {
    return null;
  }

  return (
    <section className="pt-4">
      <h2 className="text-xl font-black text-white mb-3">
        Kaynaklar
      </h2>

      <ul className="space-y-2">
        {sources.map(
          (
            source,
            index
          ) => (
            <li
              key={`${source}-${index}`}
            >
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-cyan-400 transition-colors break-words"
              >
                <span className="text-cyan-500">
                  ↗
                </span>

                <span>
                  {sourceLabel(
                    source
                  )}
                </span>
              </a>
            </li>
          )
        )}
      </ul>
    </section>
  );
}

export function ReviewBody({
  blocks,
}: {
  blocks: ReviewBlock[];
}) {
  return (
    <div className="space-y-6 text-zinc-300 leading-8 break-words">
      {blocks.map(
        (block, index) => {
          if (
            block.type === "h2"
          ) {
            return (
              <h2
                key={index}
                id={`bolum-${index}`}
                className="scroll-mt-24 text-2xl font-black text-white pt-4"
              >
                {block.value}
              </h2>
            );
          }

          if (
            block.type === "h3"
          ) {
            return (
              <h3
                key={index}
                id={`bolum-${index}`}
                className="scroll-mt-24 text-xl font-bold text-white"
              >
                {block.value}
              </h3>
            );
          }

          if (
            block.type ===
            "image"
          ) {
            return imageUrl(
              block.value
            ) ? (
              <img
                key={index}
                src={imageUrl(
                  block.value
                )}
                alt="İnceleme görseli"
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl"
              />
            ) : null;
          }

          if (
            block.type ===
            "quote"
          ) {
            return (
              <blockquote
                key={index}
                className="border-l-2 border-cyan-400 pl-5 whitespace-pre-wrap"
              >
                {block.value}
              </blockquote>
            );
          }

          if (
            block.type ===
            "list"
          ) {
            return (
              <ul
                key={index}
                className="list-disc pl-6"
              >
                {block.value
                  .split("\n")
                  .filter((value) =>
                    value.trim()
                  )
                  .map(
                    (
                      value,
                      listIndex
                    ) => (
                      <li
                        key={
                          listIndex
                        }
                      >
                        {value}
                      </li>
                    )
                  )}
              </ul>
            );
          }

          if (
            block.type ===
            "sources"
          ) {
            return (
              <SourceBlock
                key={index}
                value={
                  block.value
                }
              />
            );
          }

          if (
            block.type ===
            "table"
          ) {
            const rows =
              block.value
                .split("\n")
                .filter((value) =>
                  value.trim()
                )
                .map((value) =>
                  value
                    .split("|")
                    .map((cell) =>
                      cell.trim()
                    )
                );

            return (
              <div
                key={index}
                className="overflow-x-auto rounded-xl border border-zinc-800"
              >
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr>
                      {rows[0]?.map(
                        (
                          cell,
                          cellIndex
                        ) => (
                          <th
                            key={
                              cellIndex
                            }
                            className="p-3 bg-zinc-900 text-cyan-400"
                          >
                            {cell}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {rows
                      .slice(1)
                      .map(
                        (
                          row,
                          rowIndex
                        ) => (
                          <tr
                            key={
                              rowIndex
                            }
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
                                  className="p-3 border-t border-zinc-800"
                                >
                                  {
                                    cell
                                  }
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
          }

          return (
            <p
              key={index}
              className="whitespace-pre-wrap"
            >
              {block.value}
            </p>
          );
        }
      )}
    </div>
  );
}