#!/usr/bin/env node

import { config } from 'dotenv';
import { Resend } from 'resend';

// Load environment variables from .env.local
config({ path: '.env.local' });
import { getVerificationEmailTemplate } from '../src/lib/integrations/email/templates/verification-email';
import { getPasswordResetEmailTemplate } from '../src/lib/integrations/email/templates/password-reset-email';
import { createContactEmailTemplate } from '../src/lib/integrations/email/templates/contact-form';

const sampleData = {
  verification: {
    verificationCode: '123456'
  },
  passwordReset: {
    resetCode: '789012'
  },
  contact: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    subject: 'Test Contact Form Submission',
    message: 'This is a test message from the contact form. This demonstrates how contact form emails will appear when users submit inquiries through the website.'
  }
};

async function sendVerificationEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const htmlContent = getVerificationEmailTemplate(sampleData.verification);

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM || 'noreply@email.domari.app',
    to: process.env.RESEND_EMAIL_TO || 'support@domari.app',
    subject: 'Test: Email Verification Code - Domari',
    html: htmlContent
  });

  if (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }

  console.log('✅ Verification email sent successfully');
  console.log(`📧 Email ID: ${data?.id}`);
  return true;
}

async function sendPasswordResetEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const htmlContent = getPasswordResetEmailTemplate(sampleData.passwordReset);

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM || 'noreply@email.domari.app',
    to: process.env.RESEND_EMAIL_TO || 'support@domari.app',
    subject: 'Test: Password Reset Code - Domari',
    html: htmlContent
  });

  if (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }

  console.log('✅ Password reset email sent successfully');
  console.log(`📧 Email ID: ${data?.id}`);
  return true;
}

async function sendContactEmail() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const htmlContent = createContactEmailTemplate(sampleData.contact);

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM || 'noreply@email.domari.app',
    to: process.env.RESEND_EMAIL_TO || 'support@domari.app',
    subject: 'Test: Contact Form Submission - Domari',
    html: htmlContent
  });

  if (error) {
    console.error('❌ Failed to send contact email:', error);
    return false;
  }

  console.log('✅ Contact form email sent successfully');
  console.log(`📧 Email ID: ${data?.id}`);
  return true;
}

async function sendAllEmails() {
  console.log('📨 Sending all test emails...\n');

  const results = await Promise.allSettled([
    sendVerificationEmail(),
    sendPasswordResetEmail(),
    sendContactEmail()
  ]);

  const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
  console.log(`\n📊 Results: ${successful}/3 emails sent successfully`);
}

async function main() {
  const emailType = process.argv[2];

  if (!emailType) {
    console.log('📧 Email Test Script - Domari');
    console.log('\nUsage:');
    console.log('  npm run test:emails verification   - Send verification email');
    console.log('  npm run test:emails password-reset - Send password reset email');
    console.log('  npm run test:emails contact        - Send contact form email');
    console.log('  npm run test:emails all           - Send all three emails');
    console.log(`\n📍 Test emails will be sent to: ${process.env.RESEND_EMAIL_TO || 'support@domari.app'}`);
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Error: RESEND_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log(`📧 Sending ${emailType} email(s) to ${process.env.RESEND_EMAIL_TO || 'support@domari.app'}...\n`);

  try {
    switch (emailType) {
      case 'verification':
        await sendVerificationEmail();
        break;
      case 'password-reset':
        await sendPasswordResetEmail();
        break;
      case 'contact':
        await sendContactEmail();
        break;
      case 'all':
        await sendAllEmails();
        break;
      default:
        console.error(`❌ Unknown email type: ${emailType}`);
        console.log('\nValid options: verification, password-reset, contact, all');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

main();