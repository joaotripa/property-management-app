export function getWelcomeEmailTemplate(): string {
  const currentYear = new Date().getFullYear();
  const logoUrl = 'https://domari.app/domari-logo.png';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to Domari</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; color: #1E293B;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #E2E8F0; background-color: #ffffff;">

              <!-- Header -->
              <tr>
                <td style="background: #ffffff; padding: 40px 32px; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <a href="https://domari.app" target="_blank" style="text-decoration: none;">
                        <td style="text-align: center;">
                          <img alt="Domari Logo" src="${logoUrl}" style="height: 60px; width: auto; display: inline-block; vertical-align: middle; margin-right: 8px;">
                        </td>
                      </a>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 32px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #1E293B; font-size: 24px; margin: 0 0 10px 0; font-weight: 600;">Welcome to Domari! </h2>
                  </div>

                  <!-- Welcome Message -->
                  <div style="margin: 30px 0;">
                    <p style="color: #1E293B; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                      We're excited to have you on board.
                    </p>
                    <p style="color: #1E293B; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                      Your <strong>14-day free trial has officially started</strong>, giving you full access to all Business plan features. No credit card required — just dive in and see how Domari can simplify your property finances.
                    </p>
                    <p style="color: #1E293B; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                      Domari helps you eliminate spreadsheet chaos by providing an intuitive platform to manage your portfolio, track rental income, expenses, and generate tax-ready reports — all in one place.
                    </p>
                  </div>

                  <!-- What's Next -->
                  <div style="background: #F1F5F9; border-radius: 8px; padding: 24px; margin: 30px 0; border: 1px solid #E2E8F0;">
                    <h3 style="color: #1E293B; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Here's what to do next:</h3>
                    <ul style="color: #1E293B; font-size: 15px; line-height: 1.7; margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 10px;"><strong>Add your first property</strong> — it takes less than a minute</li>
                      <li style="margin-bottom: 10px;"><strong>Track your transactions</strong> — income and expenses in one place</li>
                      <li style="margin-bottom: 10px;"><strong>Explore the dashboard</strong> — see your financial insights come to life</li>
                      <li style="margin-bottom: 0;"><strong>Generate reports</strong> — get tax-ready reports with a single click</li>
                    </ul>
                  </div>

                  <div style="margin: 30px 0;">
                    <p style="color: #1E293B; font-size: 15px; line-height: 1.7; margin: 0 0 15px 0;">
                      If you have any questions or need assistance, feel free to reach out. We're here to help you succeed.
                    </p>
                    <p style="color: #1E293B; font-size: 15px; line-height: 1.7; margin: 0;">
                      Let's make property management simple,<br/>
                      <strong>João Tripa, Founder</strong>
                    </p>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 35px 0 20px 0;">
                    <a href="https://domari.app/dashboard" style="display: inline-block; background-color: #2F6DF2; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Go to Dashboard
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1E293B; text-align: center; padding: 30px 32px; font-size: 14px; color: #94A3B8;">
                  <p style="margin: 0 0 10px 0;">
                    © ${currentYear} Domari. All rights reserved.
                  </p>
                  <p style="color: #64748B; font-size: 12px; margin: 0 0 10px 0;">
                    Making property finances simple and efficient.
                  </p>
                  <p style="color: #64748B; font-size: 12px; margin: 0;">
                    Questions? Reply to this email or reach us at <a href="mailto:support@domari.app" style="color: #2F6DF2; text-decoration: none;">support@domari.app</a>
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
