/**
 * Validated body for `PATCH /admin/seasons/:id`. `externalId` is editable —
 * the common case is attaching a real football-data.org id to a
 * manually-created (synthetic negative id) season so `FootballSyncService`
 * starts tracking it going forward. Collisions with an already-synced
 * season's `externalId` are caught by the DB's unique constraint
 * (`AdminSeasonsService.mapError`'s P2002 → 409), so this can't silently
 * duplicate a real season. Retargeting an *already-synced* season's
 * `externalId` away from its real value does detach it from future syncs
 * (the next sync run just re-creates a fresh row for the real season) — a
 * deliberate admin action, not a footgun the API needs to block.
 */
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateSeasonDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  currentMatchday?: number;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsInt()
  externalId?: number;
}
