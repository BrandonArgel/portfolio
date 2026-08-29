import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { serverEnv } from '@/data/serverEnv'
import { db } from '@/db'
import * as schema from '@/db/schema'

export const auth = betterAuth({
  appName: 'Portfolio',
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
  },
  socialProviders: {
    discord: {
      clientId: serverEnv.DISCORD_CLIENT_ID as string,
      clientSecret: serverEnv.DISCORD_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: serverEnv.FACEBOOK_CLIENT_ID as string,
      clientSecret: serverEnv.FACEBOOK_CLIENT_SECRET as string,
    },
    github: {
      clientId: serverEnv.GITHUB_CLIENT_ID as string,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID as string,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET as string,
    },
    // spotify: {
    //   clientId: serverEnv.SPOTIFY_CLIENT_ID as string,
    //   clientSecret: serverEnv.SPOTIFY_CLIENT_SECRET as string,
    // },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['discord', 'facebook', 'google', 'github'],
      requireLocalEmailVerified: false,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  plugins: [admin()],
})
