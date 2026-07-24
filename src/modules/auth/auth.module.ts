/**
 * Owns everything credentials/session-related: register, login, logout, and
 * the passport JWT strategy that protects the rest of the app.
 *
 * Imports `UsersModule` (to create/look up users — AuthService never touches
 * Prisma directly) and `PassportModule` (required host module for any
 * passport strategy). `JwtModule.registerAsync` reads `JWT_SECRET`/
 * `JWT_EXPIRES_IN` from `ConfigService` rather than hardcoding them, so the
 * same module works across dev/docker/prod with just different env vars.
 * `expiresIn` is cast to `StringValue` (from the `ms` package's types,
 * transitively available via `@nestjs/jwt`) because `ConfigService.get`
 * returns a plain `string` and TS can't narrow it to the branded template-
 * literal type `@nestjs/jwt` expects.
 */
import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as StringValue,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
