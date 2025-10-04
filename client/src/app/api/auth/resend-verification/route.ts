import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/config/database"
import { AuthLogger } from "@/lib/utils/auth"
import { sendVerificationEmail } from "@/lib/services/server/emailService"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    AuthLogger.info({ action: 'resend_verification_attempt', email })

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: "If an account with this email exists, a new verification code has been sent." },
        { status: 200 }
      )
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email
      }
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      }
    })

    await sendVerificationEmail(email, verificationCode)

    return NextResponse.json(
      { message: "If an account with this email exists, a new verification code has been sent." },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown resend error'
    AuthLogger.error({ action: 'resend_verification_error', error: errorMessage })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}