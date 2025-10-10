/**
 * Timezone utilities for handling date conversions and formatting
 * Following industry best practices:
 * - Store UTC in database
 * - Display in user timezone
 * - Use safe date formatting to avoid timezone shift bugs
 */

/**
 * Safely format a date for form inputs without timezone shift
 * Replaces the problematic toISOString().split("T")[0] pattern
 *
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format, no timezone shift
}

/**
 * Format a date for user display in their timezone
 *
 * @param date - The date to format
 * @param userTimezone - IANA timezone identifier (e.g., 'Europe/London')
 * @param format - Optional format style (default: 'medium')
 * @returns Formatted date string in user's timezone
 */
export function formatDateForUser(
  date: Date,
  userTimezone: string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: userTimezone,
    year: 'numeric',
    month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
    day: 'numeric'
  };

  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
}

/**
 * Parse a date string without timezone assumptions
 * Explicitly treats the input as local time
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseUserDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00'); // Explicit local time
}

/**
 * Get system timezone as fallback
 *
 * @returns IANA timezone identifier for system timezone
 */
export function getSystemTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format date for CSV exports in user timezone
 *
 * @param date - The date to format
 * @param userTimezone - IANA timezone identifier
 * @returns Date string in YYYY-MM-DD format in user timezone
 */
export function formatDateForExport(date: Date, userTimezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: userTimezone,
  }).format(date);
}

/**
 * Check if a date string is valid
 *
 * @param dateString - Date string to validate
 * @returns True if valid date
 */
export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}