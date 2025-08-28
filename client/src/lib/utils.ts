import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toCamelCase(str: string): string {
  return str.toLowerCase().split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
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
