import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { competitions } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const competitionData = [
  { id: 2021, name: "Premier League",   code: "PL",  country: "England", emblemUrl: "https://crests.football-data.org/PL.png" },
  { id: 2002, name: "Bundesliga",       code: "BL1", country: "Germany", emblemUrl: "https://crests.football-data.org/BL1.png" },
  { id: 2019, name: "Serie A",          code: "SA",  country: "Italy",   emblemUrl: "https://crests.football-data.org/c111.png" },
  { id: 2014, name: "La Liga",          code: "PD",  country: "Spain",   emblemUrl: "https://crests.football-data.org/laliga.png" },
  { id: 2015, name: "Ligue 1",          code: "FL1", country: "France",  emblemUrl: "https://crests.football-data.org/FL1.png" },
  { id: 2001, name: "Champions League", code: "CL",  country: "Europe",  emblemUrl: "https://crests.football-data.org/CL.png" },
];

async function seed() {
  console.log("Seeding competitions...");
  await db.insert(competitions).values(competitionData).onConflictDoNothing();
  console.log("Done! 6 competitions inserted.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
