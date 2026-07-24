/**
 * Injectable Prisma client used throughout the app for DB access.
 *
 * Extends the generated `PrismaClient` (from `generated/prisma/client`, the
 * new Prisma 7 `prisma-client` TS generator output — see prisma/schema.prisma
 * for the `moduleFormat = "cjs"` generator setting this depends on) rather
 * than wrapping it, so callers can use `this.prisma.user.findMany()` etc.
 * directly. Constructed with `@prisma/adapter-pg` (the `pg` driver) because
 * Prisma 7's TS client generator requires an explicit driver adapter — there
 * is no bundled query engine binary anymore. Connects in `onModuleInit` and
 * disconnects in `onModuleDestroy` so the pool's lifecycle matches Nest's.
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
