import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/ipl_auction?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  AUTH_SECRET: z.string().default('ipl-auction-dev-secret-key-change-in-production-min32chars'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 2)
  );
  // Don't exit in dev - use defaults
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsed.success ? parsed.data : {
  NODE_ENV: 'development' as const,
  PORT: 3001,
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/ipl_auction?schema=public',
  REDIS_URL: 'redis://localhost:6379',
  AUTH_SECRET: 'ipl-auction-dev-secret-key-change-in-production-min32chars',
  CLIENT_URL: 'http://localhost:3000',
  JWT_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:3000',
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX_REQUESTS: 100,
};

export type Env = z.infer<typeof envSchema>;
