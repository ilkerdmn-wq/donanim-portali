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

    const document =
      comparisons.find(
        (comparison) =>
          comparison.published
      ) || null;

    return NextResponse.json(
      {
        document,
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