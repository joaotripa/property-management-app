export interface VerificationEmailProps {
  verificationCode: string;
}

export function getVerificationEmailTemplate({ verificationCode }: VerificationEmailProps): string {
  const currentYear = new Date().getFullYear();
  const logoUrl = 'https://domari.app/Domari-Logo-Icon.png';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verification Code - Domari</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; color: #1E293B;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; background-color: #ffffff;">

              <!-- Header -->
              <tr>
                <td style="background: #2F6DF2; color: #ffffff; padding: 40px 32px; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center;">
                        <img alt="Domari Logo" src="${logoUrl}" style="height: 60px; width: auto; display: inline-block; vertical-align: middle; margin-right: 8px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 600; display: inline-block; vertical-align: middle;">Domari</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 32px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1E293B; font-size: 24px; margin: 0 0 10px 0; font-weight: 600;">Verification code</h2>
                    <p style="color: #64748B; font-size: 16px; margin: 0; line-height: 1.5;">
                      Thank you for signing up!
                      Please enter this verification code to complete your account setup:
                    </p>
                  </div>

                  <!-- Verification Code -->
                  <div style="text-align: center; margin: 40px 0;">
                    <div style="display: inline-block; background: #F1F5F9; border: 2px solid #2F6DF2; border-radius: 12px; padding: 20px 30px;">
                      <span style="font-size: 36px; font-weight: bold; color: #2F6DF2; letter-spacing: 8px; font-family: 'Geist Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;">
                        ${verificationCode}
                      </span>
                    </div>
                    <p style="color: #64748B; font-size: 14px; margin: 15px 0 0 0;">
                      This code expires in 10 minutes
                    </p>
                  </div>

                  <div style="background: #F1F5F9; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #E2E8F0;">
                    <p style="color: #64748B; font-size: 14px; margin: 0; line-height: 1.5;">
                      <strong style="color: #1E293B;">Security notice:</strong> If you didn't create an account with Domari, please contact our support@domari.app for further investigation. Your security is important to us.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1E293B; text-align: center; padding: 30px 32px; font-size: 14px; color: #94A3B8;">
                  <p style="margin: 0 0 10px 0;">
                    © ${currentYear} Domari. All rights reserved.
                  </p>
                  <p style="color: #64748B; font-size: 12px; margin: 0;">
                    Making property finances simple and efficient.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}