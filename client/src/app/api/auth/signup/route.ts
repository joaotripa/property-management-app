import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/config/database"
import { Resend } from "resend"
import { AuthLogger } from "@/lib/utils/auth"
import { getVerificationEmailTemplate } from "@/lib/integrations/email/templates/verification-email"
import { createStripeCustomer } from "@/lib/stripe/subscriptions"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      AuthLogger.signUpFailure(email || 'unknown', 'Missing email or password')
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

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

    // Create Stripe customer and subscription with 14-day trial
    try {
      await createStripeCustomer({
        userId: user.id,
        email: user.email,
      });
      AuthLogger.info({ action: 'stripe_customer_created', email: user.email });
    } catch (stripeError) {
      AuthLogger.error({
        action: 'stripe_customer_creation_failed',
        email: user.email,
        error: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
      });
      // Don't fail the signup if Stripe customer creation fails
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
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

      AuthLogger.info({ action: 'verification_email_sent', email })
    } catch (emailError) {
      AuthLogger.error({ 
        action: 'verification_email_failed', 
        email, 
        error: emailError instanceof Error ? emailError.message : 'Unknown email error' 
      })
      // Don't fail the signup if email fails
    }

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