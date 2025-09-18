export interface PasswordResetEmailProps {
  resetCode: string;
}

export function getPasswordResetEmailTemplate({ resetCode }: PasswordResetEmailProps): string {
  const currentYear = new Date().getFullYear();

  return `
    <div style="max-width: 600px; border-radius: 8px; margin: 0 auto; background-color: #F8FAFC; font-family: system-ui, -apple-system, sans-serif;">
      <!-- Header -->
      <div style="background: #6366F1; padding: 40px 20px; text-align: center;">
        <img alt="domari-logo" src="/Domari-Logo.png" style="height: 60px; width: auto; display: block; margin: 0 auto;">
      </div>
            
      <!-- Content -->
      <div style="background: white; padding: 40px 20px; margin: 0;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #253439; font-size: 24px; margin: 0 0 10px 0;">Reset password code</h2>
          <p style="color: #6B7280; font-size: 16px; margin: 0; line-height: 1.5;">
            We received a request to reset your password. Enter this code to create a new password:
          </p>
        </div>
        
        <!-- Reset Code -->
        <div style="text-align: center; margin: 40px 0;">
          <div style="display: inline-block; background: #F8FAFC; border: 2px solid #6366F1; border-radius: 12px; padding: 20px 30px;">
            <span style="font-size: 36px; font-weight: bold; color: #6366F1; letter-spacing: 8px; font-family: monospace;">
              ${resetCode}
            </span>
          </div>
          <p style="color: #6B7280; font-size: 14px; margin: 15px 0 0 0;">
            This code expires in 10 minutes
          </p>
        </div>

        <div style="background: #F8FAFC; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <p style="color: #6B7280; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong style="color: #253439;">Security notice:</strong> If you didn't request a password reset, please contact our support@domari.app for further investigation. Your security is important to us.
          </p>
        </div>
        

      </div>
      
      <!-- Footer -->
      <div style="background: #334155; padding: 30px 20px; text-align: center;">
        <p style="color: #94A3B8; font-size: 14px; margin: 0 0 10px 0;">
          © ${currentYear} Domari. All rights reserved.
        </p>
        <p style="color: #64748B; font-size: 12px; margin: 0;">
          Making property management simple and efficient.
        </p>
      </div>
    </div>
  `;
}