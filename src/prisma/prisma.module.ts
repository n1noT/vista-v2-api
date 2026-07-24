/**
 * Wraps PrismaService as a `@Global()` Nest module so it's injectable in any
 * feature module (UsersModule, AuthModule, and future ones) without each of
 * them re-importing PrismaModule individually.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
