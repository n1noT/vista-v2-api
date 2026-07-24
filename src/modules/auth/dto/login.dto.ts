/**
 * Validated body for `POST /auth/login`. Deliberately minimal — just format
 * validation (valid email shape, password present as a string).
 */
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
