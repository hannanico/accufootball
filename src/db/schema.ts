import { pgTable, integer, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const competitions = pgTable("competitions", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  country: text("country").notNull(),
  emblemUrl: text("emblem_url").notNull(),
});

export const matches = pgTable("matches", {
  id: integer("id").primaryKey(),
  competitionId: integer("competition_id").references(() => competitions.id).notNull(),
  matchday: integer("matchday").notNull(),
  season: text("season").notNull(),
  homeTeamId: integer("home_team_id").notNull(),
  homeTeamName: text("home_team_name").notNull(),
  homeTeamShort: text("home_team_short").notNull(),
  homeTeamCrest: text("home_team_crest").notNull(),
  awayTeamId: integer("away_team_id").notNull(),
  awayTeamName: text("away_team_name").notNull(),
  awayTeamShort: text("away_team_short").notNull(),
  awayTeamCrest: text("away_team_crest").notNull(),
  utcDate: timestamp("utc_date").notNull(),
  status: text("status").notNull(),         // SCHEDULED | LIVE | FINISHED
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  winner: text("winner"),                   // HOME_TEAM | DRAW | AWAY_TEAM | null
  lastUpdated: timestamp("last_updated").notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const selections = pgTable("selections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  competitionId: integer("competition_id").references(() => competitions.id).notNull(),
  prediction: text("prediction").notNull(),  // HOME_TEAM | DRAW | AWAY_TEAM
  isCorrect: boolean("is_correct"),          // null until match FINISHED
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
