import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AuthLogger } from "@/lib/auth-logger"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      AuthLogger.emailVerificationFailure(email || 'unknown', 'Missing email or code')
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      )
    }

    AuthLogger.emailVerificationAttempt(email)

    const verificationCode = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!verificationCode) {
      AuthLogger.emailVerificationFailure(email, 'Invalid or expired verification code')
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      }
    })

    await prisma.verificationToken.delete({
      where: { 
        identifier_token: {
          identifier: email,
          token: code
        }
      }
    })

    AuthLogger.emailVerificationSuccess(email)

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown verification error'
    AuthLogger.error({ action: 'email_verification_error', error: errorMessage })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}