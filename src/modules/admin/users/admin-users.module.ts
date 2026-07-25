/**
 * Wires `AdminUsersController` to `UsersService` — imports `UsersModule`
 * rather than duplicating Prisma access, per the reuse `UsersModule`'s
 * header comment already anticipated for admin ban/edit/delete.
 */
import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [UsersModule],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
