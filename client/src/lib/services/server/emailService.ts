import { Resend } from "resend";
import { AuthLogger } from "@/lib/utils/auth";
import {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
  createContactEmailTemplate,
  createPlainContactEmail
} from "@/lib/integrations/email";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_EMAIL_FROM || 'noreply@email.domari.app';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

export async function sendVerificationEmail(
  email: string,
  verificationCode: string
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${verificationCode} is your verification code`,
      html: getVerificationEmailTemplate({ verificationCode })
    });

    AuthLogger.info({ action: 'verification_email_sent', email });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
    AuthLogger.error({
      action: 'verification_email_failed',
      email,
      error: errorMessage
    });
    return { success: false, error: errorMessage };
  }
}

export async function sendWelcomeEmail(email: string): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to Domari - Your Free Trial Has Started! 🎉',
      html: getWelcomeEmailTemplate()
    });

    AuthLogger.info({ action: 'welcome_email_sent', email });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
    AuthLogger.error({
      action: 'welcome_email_failed',
      email,
      error: errorMessage
    });
    return { success: false, error: errorMessage };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetCode: string
): Promise<EmailResult> {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${resetCode} is your reset password code`,
      html: getPasswordResetEmailTemplate({ resetCode })
    });

    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
    console.error('Failed to send password reset email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendContactEmail(
  formData: ContactFormData
): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [process.env.RESEND_EMAIL_TO!],
      subject: `New Message from ${formData.name} - ${formData.subject}`,
      html: createContactEmailTemplate(formData),
      text: createPlainContactEmail(formData),
      replyTo: formData.email,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: error.message };
    }

    console.log("Contact email sent successfully:", { id: data?.id });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
    console.error("Contact email error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
