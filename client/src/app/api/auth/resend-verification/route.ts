import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { AuthLogger } from "@/lib/auth-logger"
import { getVerificationEmailTemplate } from "@/lib/email-templates/verification-email"

const resend = new Resend(process.env.RESEND_API_KEY)

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

    try {
      await resend.emails.send({
        from: process.env.RESEND_EMAIL_FROM || 'noreply@email.domari.app',
        to: email,
        subject: `${verificationCode} is your verification code`,
        html: getVerificationEmailTemplate({ verificationCode })
      })

      AuthLogger.info({ action: 'resend_verification_email_sent', email })
    } catch (emailError) {
      AuthLogger.error({ 
        action: 'resend_verification_email_failed', 
        email, 
        error: emailError instanceof Error ? emailError.message : 'Unknown email error' 
      })
      // Don't fail the request if email fails
    }

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