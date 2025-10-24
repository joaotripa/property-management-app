import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toCamelCase(str: string): string {
  if (!str) return "";

  const normalized = str
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();

  if (!normalized) return "";

  return normalized
    .split(' ')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function getAuthErrorMessage(err: unknown): string {
  if (typeof err === "string") {
    return err;
  }
  
  if (typeof err === "object" && err !== null) {
    if ("message" in err && typeof err.message === "string") {
      return err.message;
    }
    if ("error" in err && typeof err.error === "string") {
      return err.error;
    }
  }
  
  return "An unknown error occurred. Please try again.";
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function getUserInitials(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  // Clean the name and split into words
  const words = name
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);

  if (words.length === 0) {
    return "";
  }

  // Get first letter of first word and first letter of last word (if exists)
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export { maskEmail } from "./email";

