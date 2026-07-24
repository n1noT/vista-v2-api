/**
 * Application entry point — bootstraps the Nest app and configures everything
 * that has to happen before any request is handled.
 *
 * - Loads `.env` via `dotenv/config` so DATABASE_URL/JWT_SECRET/PORT etc. are
 *   populated outside of the Prisma CLI too (see prisma.config.ts, which does
 *   its own dotenv load for CLI commands like `prisma migrate dev`).
 * - `cookie-parser` middleware so `req.cookies` exists (JwtStrategy reads the
 *   access_token cookie from it).
 * - A global `ValidationPipe` (whitelist + transform) so every controller's
 *   DTOs are validated/coerced without repeating pipe wiring per-route.
 * - CORS with `credentials: true` and an explicit origin allowlist read from
 *   FRONTEND_URL (comma-separated) — required because the front (:4200) and
 *   this API (:3000) are different origins, and credentialed requests reject
 *   a wildcard origin.
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Wildcard origin is rejected once credentials:true is set, so this must be explicit.
  const frontendUrl = configService.get<string>('FRONTEND_URL', '');
  app.enableCors({
    origin: frontendUrl.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
