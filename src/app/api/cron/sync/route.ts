import { syncCompetitionMatches, syncFinishedMatches } from "@/lib/syncMatches";
import { NextResponse, NextRequest } from "next/server";

const COMPETITION_IDS = [2021, 2002, 2019, 2014, 2015, 2001];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await Promise.all(
    COMPETITION_IDS.flatMap((id) => [
      syncCompetitionMatches(id),
      syncFinishedMatches(id),
    ])
  );
  return NextResponse.json({ ok: true });
}
