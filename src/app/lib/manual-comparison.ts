export type ComparisonColumn = {
  id: string;
  name: string;
  reviewSlug: string;
  imageUrl: string;
};

export type ComparisonCell = {
  value: string;
  highlighted: boolean;
};

export type ComparisonRow = {
  id: string;
  label: string;
  cells: Record<string, ComparisonCell>;
};

export type ManualComparison = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  published: boolean;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  createdAt: string;
  updatedAt: string;
};

export const featureLabels = [
  "İşlemci",
  "Harici GPU",
  "RAM",
  "RAM hızı",
  "RAM yükseltme",
  "Ekran",
  "Yenileme",
  "Parlaklık",
  "Renk kapsamı",
  "SSD",
  "Dahili grafik",
  "Thunderbolt 4",
  "Wi-Fi",
  "Bluetooth",
  "Pil",
  "Ağırlık",
  "Kalınlık",
  "Kamera",
];

export function createComparisonSlug(
  value: string
) {
  return value
    .toLocaleLowerCase(
      "tr-TR"
    )
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function emptyComparison(): ManualComparison {
  const columns: ComparisonColumn[] = [
    {
      id: "laptop-1",
      name: "",
      reviewSlug: "",
      imageUrl: "",
    },
    {
      id: "laptop-2",
      name: "",
      reviewSlug: "",
      imageUrl: "",
    },
  ];

  const rows: ComparisonRow[] =
    featureLabels.map(
      (
        label,
        index
      ) => ({
        id: `feature-${index + 1}`,
        label,
        cells: {
          "laptop-1": {
            value: "",
            highlighted:
              false,
          },
          "laptop-2": {
            value: "",
            highlighted:
              false,
          },
        },
      })
    );

  return {
    id: "",
    title: "",
    slug: "",
    summary: "",
    published: false,
    columns,
    rows,
    createdAt: "",
    updatedAt: "",
  };
}

export function normalizeComparison(
  value: unknown
): ManualComparison {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    throw new Error(
      "Geçersiz karşılaştırma verisi."
    );
  }

  const input =
    value as Record<
      string,
      unknown
    >;

  if (
    !Array.isArray(
      input.columns
    ) ||
    input.columns.length <
      2 ||
    input.columns.length >
      3 ||
    !Array.isArray(
      input.rows
    ) ||
    input.rows.length >
      60
  ) {
    throw new Error(
      "İki veya üç laptop ve en fazla 60 özellik girilebilir."
    );
  }

  const trim = (
    value: unknown,
    max: number
  ) =>
    typeof value ===
    "string"
      ? value
          .trim()
          .slice(0, max)
      : "";

  const image = (
    value: unknown
  ) => {
    const url = trim(
      value,
      1000
    );

    if (!url) {
      return "";
    }

    if (
      url.startsWith("/") &&
      !url.startsWith("//")
    ) {
      return url;
    }

    try {
      return new URL(
        url
      ).protocol ===
        "https:"
        ? url
        : "";
    } catch {
      return "";
    }
  };

  const columns =
    input.columns.map(
      (
        item,
        index
      ) => {
        const column =
          item as Record<
            string,
            unknown
          >;

        return {
          id: `laptop-${index + 1}`,
          name: trim(
            column?.name,
            180
          ),
          reviewSlug:
            trim(
              column?.reviewSlug,
              220
            ),
          imageUrl:
            image(
              column?.imageUrl
            ),
        };
      }
    );

  const rows =
    input.rows.map(
      (
        item,
        index
      ) => {
        const row =
          item as Record<
            string,
            unknown
          >;

        const oldCells =
          row?.cells &&
          typeof row.cells ===
            "object"
            ? (row.cells as Record<
                string,
                unknown
              >)
            : {};

        const cells: Record<
          string,
          ComparisonCell
        > = {};

        columns.forEach(
          (
            column,
            columnIndex
          ) => {
            const oldId =
              trim(
                (
                  input.columns as Record<
                    string,
                    unknown
                  >[]
                )[
                  columnIndex
                ]?.id,
                40
              );

            const cell =
              (oldCells[
                oldId
              ] ||
                oldCells[
                  column.id
                ] ||
                {}) as Record<
                string,
                unknown
              >;

            cells[
              column.id
            ] = {
              value: trim(
                cell.value,
                300
              ),
              highlighted:
                cell.highlighted ===
                true,
            };
          }
        );

        return {
          id: `feature-${index + 1}`,
          label: trim(
            row?.label,
            100
          ),
          cells,
        };
      }
    );

  const published =
    input.published ===
    true;

  if (
    published &&
    (
      !trim(
        input.title,
        180
      ) ||
      !trim(
        input.slug,
        220
      ) ||
      columns.some(
        (column) =>
          !column.name ||
          !column.reviewSlug
      ) ||
      !rows.length ||
      rows.some(
        (row) =>
          !row.label
      )
    )
  ) {
    throw new Error(
      "Yayınlamak için başlık, slug, model adları, incelemeler ve özellik satırlarını doldur."
    );
  }

  const now =
    new Date().toISOString();

  return {
    id: trim(
      input.id,
      120
    ),

    title: trim(
      input.title,
      180
    ),

    slug:
      createComparisonSlug(
        trim(
          input.slug,
          220
        )
      ),

    summary: trim(
      input.summary,
      400
    ),

    published,

    columns,

    rows,

    createdAt:
      trim(
        input.createdAt,
        80
      ) || now,

    updatedAt:
      trim(
        input.updatedAt,
        80
      ) || now,
  };
}