/**
 * Validated body for `PATCH /admin/leagues/:id`. `externalId` is editable —
 * the common case is attaching a real football-data.org id to a
 * manually-created (synthetic negative id) league so `FootballSyncService`
 * starts tracking it going forward. Collisions with an already-synced
 * league's `externalId` are caught by the DB's unique constraint
 * (`AdminLeaguesService.mapError`'s P2002 → 409), so this can't silently
 * duplicate a real league. Retargeting an *already-synced* league's
 * `externalId` away from its real value does detach it from future syncs
 * (the next sync run just re-creates a fresh row for the real league) — a
 * deliberate admin action, not a footgun the API needs to block.
 */
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateLeagueDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsInt()
  externalId?: number;
}
