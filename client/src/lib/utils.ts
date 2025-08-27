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
