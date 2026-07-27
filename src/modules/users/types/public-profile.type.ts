/**
 * Return shape for `GET /users/:id` — the read-only profile any logged-in
 * player can view for any other player (`/profile/:id` on the front,
 * `Arborescence_Pages.md`). Deliberately narrower than `AuthenticatedUser`:
 * no `email`, `bannedAt`, `role`, or `updatedAt` — none of those are another
 * player's business, unlike the self-service `/users/me` response.
 */
export interface PublicProfile {
  id: string;
  pseudo: string;
  avatarUrl: string | null;
  createdAt: string;
}
