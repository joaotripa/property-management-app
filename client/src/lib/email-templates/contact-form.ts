interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
  }
  
  export function createContactEmailTemplate(data: ContactFormData): string {
    const { name, email, subject, message } = data;
    const timestamp = new Date().toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <link href="https://fonts.googleapis.com/css?family=Montserrat:700,600,500,400&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,600,700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Nunito Sans', Arial, sans-serif;
            margin: 0;
            padding: 24px;
            background-color: #f1f5f9;
            line-height: 1.6;
            color: #0f172a;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Montserrat', Arial, sans-serif;
          }
          .font-heading {
            font-family: 'Montserrat', Arial, sans-serif;
          }
          .font-body {
            font-family: 'Nunito Sans', Arial, sans-serif;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            padding: 48px 32px;
            text-align: center;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 36px;
            font-weight: 800;
            letter-spacing: -0.025em;
            position: relative;
            z-index: 1;
          }
          .header p {
            color: #dbeafe;
            margin: 12px 0 0 0;
            font-size: 18px;
            font-weight: 500;
            position: relative;
            z-index: 1;
          }
          .content {
            padding: 48px 32px;
            background-color: #ffffff;
            color: #0f172a;
          }
          .contact-card {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 32px;
            border: 1px solid #e2e8f0;
          }
          .contact-card h2 {
            color: #0f172a;
            margin: 0 0 24px 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.025em;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .contact-card h2::before {
            content: '👤';
            font-size: 20px;
          }
          .contact-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .contact-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .contact-label {
            color: #64748b;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .contact-value {
            color: #0f172a;
            font-weight: 600;
            font-size: 15px;
            text-align: right;
            max-width: 60%;
            word-break: break-word;
          }
          .message-card {
            background-color: #f1f5f9;
            border-radius: 12px;
            padding: 32px;
            border-left: 4px solid #3b82f6;
          }
          .message-card h2 {
            color: #0f172a;
            margin: 0 0 20px 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.025em;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .message-card h2::before {
            content: '💬';
            font-size: 20px;
          }
          .message-text {
            color: #334155;
            line-height: 1.7;
            white-space: pre-wrap;
            font-size: 16px;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .footer {
            background-color: #f8fafc;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            color: #64748b;
            margin: 0;
            font-size: 14px;
            font-weight: 500;
          }
          .footer-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s ease;
          }
          .footer-link:hover {
            color: #1e40af;
            text-decoration: underline;
          }
          /* Mobile responsiveness */
          @media (max-width: 640px) {
            body {
              padding: 16px;
            }
            .email-wrapper {
              border-radius: 12px;
            }
            .header {
              padding: 40px 24px;
            }
            .header h1 {
              font-size: 32px;
            }
            .content {
              padding: 32px 24px;
            }
            .contact-card,
            .message-card {
              padding: 24px;
            }
            .contact-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }
            .contact-value {
              text-align: left;
              max-width: 100%;
            }
            .message-text {
              padding: 16px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          
          <!-- Header -->
          <div class="header">
            <h1>Domari</h1>
            <p>New Contact Form Submission</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            
            <!-- Contact Information -->
            <div class="contact-card">
              <h2>Contact Information</h2>
              <div class="contact-item">
                <span class="contact-label">Name</span>
                <span class="contact-value">${name}</span>
              </div>
              <div class="contact-item">
                <span class="contact-label">Email</span>
                <span class="contact-value">${email}</span>
              </div>
              <div class="contact-item">
                <span class="contact-label">Subject</span>
                <span class="contact-value">${subject}</span>
              </div>
              <div class="contact-item">
                <span class="contact-label">Submitted</span>
                <span class="contact-value">${timestamp}</span>
              </div>
            </div>
            
            <!-- Message -->
            <div class="message-card">
              <h2>Message</h2>
              <div class="message-text">${message}</div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>
              This message was sent from the Domari contact form at 
              <a href="https://domari.app" class="footer-link">domari.app</a>
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }