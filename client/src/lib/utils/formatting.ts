/**
 * Currency and number formatting utilities
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPercentage(
  percentage: number,
  decimals: number = 1
): string {
  return `${percentage.toFixed(decimals)}%`;
}

export function formatNumber(
  number: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("en-US", options).format(number);
}

export function formatCompactNumber(number: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

export function formatCompactCurrency(amount: number): string {
  // For small amounts (less than 1000), show full currency
  if (Math.abs(amount) < 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  // For amounts >= 1000, use compact notation
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);

  return formatted;
}