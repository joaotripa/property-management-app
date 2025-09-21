/**
 * Currency and number formatting utilities
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount === 0 ? 0 : 2,
  }).format(amount);
}

export function formatPercentage(
  percentage: number,
): string {
  return `${Math.round(percentage)}%`;
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
  const absAmount = Math.abs(amount);
  const maximumFractionDigits = absAmount === 0 ? 0 : (absAmount >= 1000 && absAmount < 1000000) ? 1 : 2;

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(amount);
}

export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}