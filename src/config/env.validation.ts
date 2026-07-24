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
});
