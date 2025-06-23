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
  
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Contact Form Submission</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; background-color: #ffffff;">
              
              <!-- Header -->
              <tr>
                <td style="background: #3b82f6; color: #ffffff; padding: 40px 32px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px;">Domari</h1>
                  <p style="margin: 8px 0 0 0; font-size: 16px;">New Contact Form Submission</p>
                </td>
              </tr>
    
              <!-- Contact Info -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin-top: 0; font-size: 20px; margin-bottom: 16px;">👤 Contact Information</h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Name:</td>
                      <td style="padding: 8px 0; text-align: right;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Email:</td>
                      <td style="padding: 8px 0; text-align: right;">${email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Subject:</td>
                      <td style="padding: 8px 0; text-align: right;">${subject}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Submitted:</td>
                      <td style="padding: 8px 0; text-align: right;">${timestamp}</td>
                    </tr>
                  </table>
                </td>
              </tr>
    
              <!-- Message -->
              <tr>
                <td style="padding: 0 32px 32px 32px;">
                  <h2 style="font-size: 20px; margin-bottom: 12px;">💬 Message</h2>
                  <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: normal; word-break: break-word;">
                    ${htmlMessage}
                  </div>
                </td>
              </tr>
    
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; text-align: center; padding: 24px; font-size: 13px; color: #64748b;">
                  This message was sent from the contact form at 
                  <a href="https://domari.app" style="color: #3b82f6; text-decoration: none;">domari.app</a>
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