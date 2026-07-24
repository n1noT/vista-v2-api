/**
 * football-data.org competition codes for the five domestic leagues Vista
 * covers (per vista-v2-docs/01_Fonctionnel/Concept_Regles.md). Champions
 * League is deliberately excluded — the Prisma schema only models
 * League/Season/Team standings, not a knockout bracket, so syncing CL
 * standings here would have nowhere meaningful to land yet.
 */
export const SYNCED_COMPETITION_CODES = [
  'FL1', // Ligue 1
  'PL', // Premier League
  'PD', // Liga (Primera División)
  'BL1', // Bundesliga
  'SA', // Serie A
] as const;
