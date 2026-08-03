import { NextResponse } from "next/server";
import { SEASON_PALETTES } from "../../../../data/palettes/seasons";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const fromDb = await prisma.seasonPalette.findMany({
      orderBy: { namePt: "asc" },
    });
    if (fromDb.length > 0) {
      return NextResponse.json({ seasons: fromDb });
    }
  } catch {
    // fallback estático se DB ainda não migrado
  }
  return NextResponse.json({ seasons: SEASON_PALETTES });
}
