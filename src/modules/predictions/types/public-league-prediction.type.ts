/**
 * Return shape for `GET /predictions/users/:userId` — the visibility-gated
 * per-league view backing `/profile/:id`'s predictions sub-view. Per
 * `Fonctionnalites_Joueurs.md` ("Le joueur peut consulter les prédictions
 * des autres joueurs s'il a prédit ce championnat ... définitivement"),
 * `items`/`totalPoints` are only populated when `visible` is true, which
 * requires *both* sides to have `SUBMITTED` (not just drafted) their own
 * prediction for that league — `targetSubmitted`/`viewerSubmitted` are
 * exposed separately so the front can render the right lock message
 * ("they haven't submitted yet" vs. "submit your own to unlock this").
 */
export interface PublicPredictionTeam {
  teamId: number;
  name: string;
  logoUrl: string | null;
  position: number;
  points: number | null;
}

export interface PublicLeaguePrediction {
  leagueId: number;
  leagueName: string;
  leagueLogoUrl: string | null;
  seasonId: number;
  targetSubmitted: boolean;
  viewerSubmitted: boolean;
  visible: boolean;
  totalPoints: number | null;
  items: PublicPredictionTeam[] | null;
}
