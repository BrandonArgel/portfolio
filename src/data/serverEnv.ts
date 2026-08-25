import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const serverEnv = createEnv({
  server: {
    // Turso Database
    DATABASE_URL: z.url(),
    DATABASE_AUTH_TOKEN: z.string().min(1, 'Turso token is required'),

    // Better Auth Configuration
    BETTER_AUTH_SECRET: z.string().min(1, 'The auth secret is required'),
    BETTER_AUTH_URL: z.url().optional(),

    // Social Providers
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),

    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    FACEBOOK_CLIENT_ID: z.string().optional(),
    FACEBOOK_CLIENT_SECRET: z.string().optional(),

    // Injected env variables
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
