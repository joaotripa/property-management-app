/**
 * Email masking utility functions
 */

/**
 * Masks an email address for privacy protection
 * 
 * @param email - The email address to mask
 * @returns Masked email address (e.g., "john.doe@gmail.com" -> "jo******@gmail.com")
 * 
 * @example
 * maskEmail("john.doe@gmail.com") // "jo******@gmail.com"
 * maskEmail("ab@company.com") // "ab@company.com" (short emails stay unchanged)
 * maskEmail("") // ""
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  const [localPart, domain] = email.split("@");
  
  if (!localPart || !domain) {
    return email;
  }

  // For very short local parts (2 chars or less), don't mask
  if (localPart.length <= 2) {
    return email;
  }

  // Mask the local part, keeping first 2 characters visible
  const maskedLocal = `${localPart.slice(0, 2)}${"*".repeat(Math.max(1, localPart.length - 2))}`;
  
  return `${maskedLocal}@${domain}`;
}
