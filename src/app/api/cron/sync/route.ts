import { syncCompetition } from "@/lib/syncMatches";
import { NextResponse, NextRequest } from "next/server";
import { checkMatchResults } from "@/app/actions/selections";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { lt, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { waitUntil } from "@vercel/functions";

const COMPETITION_IDS = [2021, 2002, 2019, 2014, 2015, 2001];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  waitUntil(
    (async () => {
  // Auto-cleanup matches older than 3 months
      await db.delete(matches).where(lt(matches.utcDate, sql`NOW() - INTERVAL '3 months'`));
      for (const id of COMPETITION_IDS) {
        await syncCompetition(id);
        await new Promise((resolve) => setTimeout(resolve, 6000));
      }
      await checkMatchResults();
      COMPETITION_IDS.forEach((id) => revalidateTag(`league-${id}`, 'max'));
    })()
  );

  return NextResponse.json({ ok: true }); 
}