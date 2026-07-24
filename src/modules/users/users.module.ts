/**
 * Owns user profile data: lookups, creation, and self-service updates.
 * Deliberately separate from AuthModule — auth owns credentials/session
 * concerns, this module owns the User record itself. Exports UsersService
 * so AuthModule can create/look up users during register/login, and so a
 * future admin module can reuse the same service for ban/edit/delete
 * (per `Fonctionnalites_Admin.md`) instead of duplicating Prisma calls.
 */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
