/**
 * The user shape that's safe to hand back to a client: Prisma's generated
 * `User` model type with `passwordHash` omitted at the type level.
 */
import { User } from '../../../generated/prisma/client';

// The shape returned to clients — never include the hash in an API response.
export type AuthenticatedUser = Omit<User, 'passwordHash'>;
