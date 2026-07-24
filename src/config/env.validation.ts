/**
 * Joi schema passed to `ConfigModule.forRoot({ validationSchema })` in
 * app.module.ts. Nest validates `process.env` against this at boot and
 * throws immediately if anything required is missing or malformed, instead
 * of failing later with a confusing runtime error.
 */
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  FRONTEND_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  // Optional (not `required()` like the vars above): missing or empty should
  // only disable the football-data sync cron, not crash the whole app at
  // boot. `.allow('')` matters because docker-compose's `${VAR:-}` always
  // sets the env var, to `""` when unset in `.env` — never truly absent.
  FOOTBALL_DATA_API_KEY: Joi.string().allow('').optional(),
  FOOTBALL_DATA_BASE_URL: Joi.string()
    .uri()
    .default('https://api.football-data.org/v4'),
});
