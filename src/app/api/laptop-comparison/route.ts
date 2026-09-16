import {
  NextResponse,
} from "next/server";

import {
  listComparisons,
} from "@/app/lib/manual-comparison-server";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const comparisons =
      await listComparisons();

    const publishedComparisons =
      comparisons.filter(
        (comparison) =>
          comparison.published
      );

    return NextResponse.json(
      {
        document:
          publishedComparisons[0] ||
          null,

        comparisons:
          publishedComparisons,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Public laptop comparison API error:",
      error
    );

    return NextResponse.json(
      {
        document: null,
        comparisons: [],
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}