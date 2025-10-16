import type { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { AuthLogger } from "@/lib/utils/auth"

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      AuthLogger.info({ action: 'user_created', email: user.email || undefined})
    },
    async signIn({ user, account }) {
      const provider = account?.provider || 'credentials'
      AuthLogger.signInSuccess(user.email || 'unknown', provider)
    },
  },
} satisfies NextAuthConfig

export default authConfig
