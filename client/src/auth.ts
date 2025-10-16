import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/config/database"
import bcrypt from "bcryptjs"
import { AuthLogger } from "@/lib/utils/auth"
import authConfig from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [
    ...authConfig.providers,
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          AuthLogger.signInFailure(credentials?.email as string || 'unknown', 'Missing credentials')
          return null
        }

        const email = credentials.email as string
        AuthLogger.signInAttempt(email)

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.passwordHash) {
          AuthLogger.signInFailure(email, 'User not found or no password')
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          AuthLogger.signInFailure(email, 'Invalid password')
          return null
        }

        AuthLogger.signInSuccess(email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        }
      }
    })
  ],
  events: {
    ...authConfig.events,
    async signIn(params) {
      if (authConfig.events?.signIn) {
        await authConfig.events.signIn(params)
      }

      // Note: Auth events are tracked client-side after successful login
      // This ensures reliable tracking with Umami Cloud
    },
  },
})