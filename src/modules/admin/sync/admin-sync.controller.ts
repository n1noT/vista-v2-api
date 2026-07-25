/**
 * `POST /admin/sync` — lets an admin force a football-data.org sync run
 * on demand (per the request that prompted this: "so we don't need to wait
 * for the cron job every time"), reusing `FootballSyncService.syncAll()`
 * exactly as the daily `@Cron` job does (`FootballSyncService.handleCron`,
 * still registered and unchanged) — this is a second caller of the same
 * method, not a separate sync path. Guarded like the other admin
 * controllers (`RolesGuard` + `@Roles(ADMIN)`).
 *
 * Returns `SyncResult` (which league synced vs. failed, and why) rather
 * than a bare 204, since an admin clicking a button deserves the same
 * visibility the cron job's logs give — see `SyncResult`'s header comment.
 * If `FOOTBALL_DATA_API_KEY` isn't set, that comes back as
 * `{ configured: false, ... }` rather than a thrown error — it's a
 * legitimate, already-supported dev-environment state (see
 * `FootballSyncService`), not a fault of this request.
 */
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FootballSyncService } from '../../football-sync/football-sync.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../../generated/prisma/client';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/sync')
export class AdminSyncController {
  constructor(private readonly footballSyncService: FootballSyncService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  sync() {
    return this.footballSyncService.syncAll();
  }
}
