import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import { getPasswordResetEmailTemplate } from "@/lib/email-templates/password-reset-email"

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

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: "If an account with this email exists, you will receive a password reset code." },
        { status: 200 }
      )
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email
      }
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetCode,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      }
    })

    try {
      await resend.emails.send({
        from: process.env.RESEND_EMAIL_FROM || 'noreply@email.domari.app',
        to: email,
        subject: `${resetCode} is your reset password code`,
        html: getPasswordResetEmailTemplate({ resetCode })
      })

      console.log(`Password reset email sent to ${email}`)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
    }

    return NextResponse.json(
      { message: "If an account with this email exists, you will receive a password reset code." },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}