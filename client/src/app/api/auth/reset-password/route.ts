import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/config/database"

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json()

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, code, and new password are required" },
        { status: 400 }
      )
    }

    const resetCode = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!resetCode) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword
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

    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email
      }
    })

    console.log(`Password reset successfully for user: ${email}`)

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}