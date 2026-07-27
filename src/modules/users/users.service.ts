/**
 * All Prisma access for the User model, used by AuthModule (register
 * looks up/creates users, login looks up by email), UsersController
 * (profile view/edit), AdminUsersController (players management —
 * list/ban/unban/delete/edit any user), and AdminDashboardController
 * (`countPlayers` — the "nombre de joueurs" stat on `/admin/dashboard`).
 *
 * - `createUser`/`updatePseudo`/`adminUpdateProfile` catch Prisma's P2002
 *   unique-constraint error and rethrow as `ConflictException` (409) with
 *   the offending field name pulled from `error.meta.target`, so callers
 *   don't need to pre-check uniqueness themselves (avoids a
 *   check-then-write race). `banUser`/`unbanUser`/`deleteUser` similarly
 *   catch P2025 (record not found) and rethrow as `NotFoundException`.
 * - `toPublicUser` strips `passwordHash` before a user is ever returned from
 *   a controller — see `AuthenticatedUser` in `common/types/`.
 * - `toPublicProfile` strips further (also `email`/`bannedAt`/`role`/
 *   `updatedAt`) for `GET /users/:id`, the read-only view one player gets of
 *   another's profile (`/profile/:id`) — see `PublicProfile`.
 */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Role, User } from '../../../generated/prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PublicProfile } from './types/public-profile.type';

export interface CreateUserInput {
  email: string;
  pseudo: string;
  passwordHash: string;
}

export interface AdminUpdateUserInput {
  pseudo?: string;
  email?: string;
  avatarUrl?: string;
  role?: Role;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserInput): Promise<User> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target =
          (error.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
        throw new ConflictException(`${target} already in use`);
      }
      throw error;
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updatePseudo(id: string, pseudo: string): Promise<User> {
    try {
      return await this.prisma.user.update({ where: { id }, data: { pseudo } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('pseudo already in use');
      }
      throw error;
    }
  }

  toPublicUser(user: User): AuthenticatedUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }

  toPublicProfile(user: User): PublicProfile {
    return {
      id: user.id,
      pseudo: user.pseudo,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };
  }

  findAll(search?: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { pseudo: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countPlayers(): Promise<{ total: number; banned: number }> {
    const [total, banned] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { bannedAt: { not: null } } }),
    ]);
    return { total, banned };
  }

  async banUser(id: string): Promise<User> {
    return this.setBannedAt(id, new Date());
  }

  async unbanUser(id: string): Promise<User> {
    return this.setBannedAt(id, null);
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw this.mapNotFound(error);
    }
  }

  async adminUpdateProfile(
    id: string,
    data: AdminUpdateUserInput,
  ): Promise<User> {
    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target =
          (error.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
        throw new ConflictException(`${target} already in use`);
      }
      throw this.mapNotFound(error);
    }
  }

  private async setBannedAt(id: string, bannedAt: Date | null): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { bannedAt },
      });
    } catch (error) {
      throw this.mapNotFound(error);
    }
  }

  private mapNotFound(error: unknown): unknown {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return new NotFoundException('User not found');
    }
    return error;
  }
}
