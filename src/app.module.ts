/**
 * Root module — assembles the app from its pieces and sets the app-wide
 * security default.
 *
 * - `ConfigModule.forRoot` is global and validates all required env vars
 *   against `envValidationSchema` at boot (fail fast on misconfiguration
 *   rather than a confusing runtime error later).
 * - `PrismaModule` is `@Global()` so `PrismaService` is injectable anywhere
 *   without re-importing it in every feature module.
 * - `UsersModule`, `AuthModule`, `LeaguesModule`, `PredictionsModule`, and
 *   `FootballSyncModule` are the domain modules; `AuthModule` depends on
 *   `UsersModule`, never the other way round.
 * - `ScheduleModule.forRoot()` is registered here (global, once app-wide) so
 *   `FootballSyncModule`'s `@Cron()` job actually fires — it's a no-op
 *   without this.
 * - `JwtAuthGuard` is registered as the global `APP_GUARD`, which makes every
 *   route require authentication by default — new controllers are protected
 *   automatically unless a handler is explicitly marked `@Public()`. This is
 *   deliberate: most of the app's future routes (predictions, admin, etc.)
 *   need auth, so "secure by default" beats "remember to guard it."
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { LeaguesModule } from './modules/leagues/leagues.module';
import { PredictionsModule } from './modules/predictions/predictions.module';
import { FootballSyncModule } from './modules/football-sync/football-sync.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    LeaguesModule,
    PredictionsModule,
    FootballSyncModule,
  ],
  controllers: [AppController],
  // Global guard: every route requires auth unless marked @Public().
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
