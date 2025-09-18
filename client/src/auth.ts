import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/config/database"
import bcrypt from "bcryptjs"
import { AuthLogger } from "@/lib/utils/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
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
          emailVerified: user.emailVerified, // Now a DateTime | null instead of boolean
        }
      }
    })
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
      AuthLogger.signInSuccess(user.email || 'unknown', account?.provider || 'credentials')
    },
  },
})