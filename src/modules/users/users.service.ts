/**
 * All Prisma access for the User model, used by both AuthModule (register
 * looks up/creates users, login looks up by email) and UsersController
 * (profile view/edit).
 *
 * - `createUser`/`updatePseudo` catch Prisma's P2002 unique-constraint error
 *   and rethrow as `ConflictException` (409) with the offending field name
 *   pulled from `error.meta.target`, so callers don't need to pre-check
 *   uniqueness themselves (avoids a check-then-write race).
 * - `toPublicUser` strips `passwordHash` before a user is ever returned from
 *   a controller — see `AuthenticatedUser` in `common/types/`.
 */
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '../../../generated/prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';

export interface CreateUserInput {
  email: string;
  pseudo: string;
  passwordHash: string;
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
}
