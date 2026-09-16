import "server-only";

import crypto from "crypto";

import {
  supabaseAdmin,
} from "./supabase-admin";

import {
  normalizeComparison,
  type ManualComparison,
} from "./manual-comparison";

const bucket =
  "editorial-content";

const comparisonsFolder =
  "laptop-comparisons";

const legacyPath =
  "laptop-comparison.json";

async function ensureBucket() {
  const storage =
    supabaseAdmin.storage;

  const {
    data: existing,
  } =
    await storage.getBucket(
      bucket
    );

  if (existing) {
    return;
  }

  const {
    error,
  } =
    await storage.createBucket(
      bucket,
      {
        public: false,
        allowedMimeTypes: [
          "application/json",
        ],
        fileSizeLimit:
          1024 * 1024,
      }
    );

  if (
    error &&
    !/already exists/i.test(
      error.message
    )
  ) {
    throw error;
  }
}

function comparisonPath(
  slug: string
) {
  return `${comparisonsFolder}/${slug}.json`;
}

export async function listComparisons(): Promise<
  ManualComparison[]
> {
  await ensureBucket();

  const storage =
    supabaseAdmin.storage;

  const {
    data,
    error,
  } =
    await storage
      .from(bucket)
      .list(
        comparisonsFolder,
        {
          limit: 1000,
          sortBy: {
            column: "name",
            order: "asc",
          },
        }
      );

  if (error) {
    return [];
  }

  const files =
    (data || []).filter(
      (item) =>
        item.name.endsWith(
          ".json"
        )
    );

  const results =
    await Promise.all(
      files.map(
        async (file) => {
          const {
            data: blob,
            error:
              downloadError,
          } =
            await storage
              .from(bucket)
              .download(
                `${comparisonsFolder}/${file.name}`
              );

          if (
            downloadError ||
            !blob
          ) {
            return null;
          }

          try {
            const raw =
              JSON.parse(
                await blob.text()
              );

            return normalizeComparison(
              raw
            );
          } catch {
            return null;
          }
        }
      )
    );

  return results
    .filter(
      (
        item
      ): item is ManualComparison =>
        Boolean(item)
    )
    .sort(
      (a, b) =>
        new Date(
          b.updatedAt
        ).getTime() -
        new Date(
          a.updatedAt
        ).getTime()
    );
}

export async function readComparisonBySlug(
  slug: string
): Promise<ManualComparison | null> {
  if (!slug) {
    return null;
  }

  await ensureBucket();

  const {
    data,
    error,
  } =
    await supabaseAdmin.storage
      .from(bucket)
      .download(
        comparisonPath(
          slug
        )
      );

  if (
    error ||
    !data
  ) {
    return null;
  }

  try {
    return normalizeComparison(
      JSON.parse(
        await data.text()
      )
    );
  } catch {
    return null;
  }
}

export async function saveComparisonBySlug(
  document: ManualComparison
): Promise<ManualComparison> {
  await ensureBucket();

  const existing =
    document.slug
      ? await readComparisonBySlug(
          document.slug
        )
      : null;

  const now =
    new Date().toISOString();

  const normalized =
    normalizeComparison({
      ...document,

      id:
        document.id ||
        existing?.id ||
        crypto.randomUUID(),

      createdAt:
        document.createdAt ||
        existing?.createdAt ||
        now,

      updatedAt: now,
    });

  const {
    error,
  } =
    await supabaseAdmin.storage
      .from(bucket)
      .upload(
        comparisonPath(
          normalized.slug
        ),
        JSON.stringify(
          normalized
        ),
        {
          contentType:
            "application/json",
          upsert: true,
          cacheControl: "0",
        }
      );

  if (error) {
    throw error;
  }

  return normalized;
}

export async function deleteComparisonBySlug(
  slug: string
) {
  await ensureBucket();

  const {
    error,
  } =
    await supabaseAdmin.storage
      .from(bucket)
      .remove([
        comparisonPath(
          slug
        ),
      ]);

  if (error) {
    throw error;
  }
}

/*
  Eski sistem için geçici uyumluluk.
  Eski laptop-comparison.json dosyası fiziksel olarak
  storage içinde kalabilir ama yeni sistem bunu kullanmaz.
*/
export async function readComparison(): Promise<
  ManualComparison | null
> {
  const {
    data,
    error,
  } =
    await supabaseAdmin.storage
      .from(bucket)
      .download(
        legacyPath
      );

  if (
    error ||
    !data
  ) {
    return null;
  }

  try {
    return normalizeComparison(
      JSON.parse(
        await data.text()
      )
    );
  } catch {
    return null;
  }
}

/*
  Eski kodların derleme sırasında bozulmaması için
  geçici wrapper.
*/
export async function saveComparison(
  document: ManualComparison
) {
  return saveComparisonBySlug(
    document
  );
}