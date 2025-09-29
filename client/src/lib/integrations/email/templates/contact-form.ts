interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
  }
  
  export function createContactEmailTemplate(data: ContactFormData): string {
    const { name, email, subject, message } = data;
    const timestamp = new Date().toLocaleString();
    const htmlMessage = message.replace(/(?:\r\n|\r|\n)/g, "<br>");
    const logoUrl = 'https://domari.app/domari-logo-icon.png';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Contact Form Submission</title>
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
                  <p style="margin: 16px 0 0 0; font-size: 16px; opacity: 0.9;">New Contact Form Submission</p>
                </td>
              </tr>

              <!-- Contact Info -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin-top: 0; font-size: 20px; margin-bottom: 16px; color: #1E293B; font-weight: 600;">👤 Contact Information</h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #64748B;">Name:</td>
                      <td style="padding: 8px 0; text-align: right; color: #1E293B;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #64748B;">Email:</td>
                      <td style="padding: 8px 0; text-align: right; color: #1E293B;">${email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #64748B;">Subject:</td>
                      <td style="padding: 8px 0; text-align: right; color: #1E293B;">${subject}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #64748B;">Submitted:</td>
                      <td style="padding: 8px 0; text-align: right; color: #1E293B;">${timestamp}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td style="padding: 0 32px 32px 32px;">
                  <h2 style="font-size: 20px; margin-bottom: 12px; color: #1E293B; font-weight: 600;">💬 Message</h2>
                  <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; font-size: 14px; line-height: 1.6; white-space: normal; word-break: break-word; color: #1E293B;">
                    ${htmlMessage}
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #1E293B; text-align: center; padding: 30px 32px; font-size: 14px; color: #94A3B8;">
                  <p style="margin: 0 0 10px 0;">
                    © ${new Date().getFullYear()} Domari. All rights reserved.
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
  
  export function createPlainContactEmail(data: ContactFormData): string {
    const { name, email, subject, message } = data;
    const timestamp = new Date().toLocaleString();

    return `New contact form submission from Domari

    Name: ${name}
    Email: ${email}
    Subject: ${subject}
    Submitted: ${timestamp}

    Message:
    ${message}

    This message was sent from the contact form at https://domari.app`;
}