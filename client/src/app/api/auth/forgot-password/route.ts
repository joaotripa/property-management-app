import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/config/database"
import { sendPasswordResetEmail } from "@/lib/services/server/emailService"

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

    await sendPasswordResetEmail(email, resetCode)

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