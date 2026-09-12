import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const serverEnv = createEnv({
  server: {
    // Turso Database
    DATABASE_URL: z.url(),
    DATABASE_AUTH_TOKEN: z.string().optional(),

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

    // Spotify
    SPOTIFY_CLIENT_ID: z.string().min(1),
    SPOTIFY_CLIENT_SECRET: z.string().min(1),
    SPOTIFY_REFRESH_TOKEN: z.string().min(1),

    // AI
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),

    // BLOB storage
    BLOB_READ_WRITE_TOKEN: z.string().min(1, 'BLOB token is required'),
    BLOB_STORE_ID: z.string().optional(),
    BLOB_WEBHOOK_PUBLIC_KEY: z.string().optional(),

    // Injected env variables
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
