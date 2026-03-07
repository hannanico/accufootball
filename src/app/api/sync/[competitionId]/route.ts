import { syncCompetitionMatches, syncFinishedMatches } from "@/lib/syncMatches";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;
  const id = Number(competitionId);

  const [matchday] = await Promise.all([
    syncCompetitionMatches(id),
    syncFinishedMatches(id),
  ]);

  return NextResponse.json({ ok: true, matchday });
}
