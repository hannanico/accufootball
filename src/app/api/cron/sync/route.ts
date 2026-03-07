import { syncCompetitionMatches, syncFinishedMatches } from "@/lib/syncMatches";
import { NextResponse } from "next/server";

const COMPETITION_IDS = [2021, 2002, 2019, 2014, 2015, 2001];

export async function GET() {
  await Promise.all(
    COMPETITION_IDS.flatMap((id) => [
      syncCompetitionMatches(id),
      syncFinishedMatches(id),
    ])
  );
  return NextResponse.json({ ok: true });
}
