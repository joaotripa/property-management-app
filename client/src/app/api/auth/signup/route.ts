import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/config/database"
import { AuthLogger } from "@/lib/utils/auth"
import { sendVerificationEmail } from "@/lib/services/server/emailService"
import { createSubscription } from "@/lib/stripe/init"
import { signupSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = signupSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      AuthLogger.signUpFailure(body.email || 'unknown', `Validation error: ${firstError.message}`)
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    AuthLogger.signUpAttempt(email)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      AuthLogger.signUpFailure(email, 'User already exists')
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Create subscription with trial for new user
    try {
      await createSubscription(user.id);
      AuthLogger.info({ action: 'subscription_created', email: user.email });
    } catch (stripeError) {
      AuthLogger.error({
        action: 'subscription_creation_failed',
        email: user.email,
        error: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
      });
      // Don't fail the signup if subscription creation fails
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      }
    })

    await sendVerificationEmail(email, verificationCode)

    AuthLogger.signUpSuccess(email)
    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email for verification code.",
        email: user.email 
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown signup error'
    AuthLogger.error({ action: 'signup_error', error: errorMessage })
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}