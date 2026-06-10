import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in IPL style (₹ Crores / Lakhs)
 */
export function formatCurrency(amountInCrores: number): string {
  if (amountInCrores >= 1) {
    const formatted = amountInCrores % 1 === 0
      ? amountInCrores.toFixed(0)
      : amountInCrores.toFixed(2).replace(/\.?0+$/, "");
    return `₹${formatted} Cr`;
  }
  const lakhs = amountInCrores * 100;
  const formatted = lakhs % 1 === 0
    ? lakhs.toFixed(0)
    : lakhs.toFixed(0);
  return `₹${formatted} L`;
}

/**
 * Format large numbers with commas (Indian numbering system)
 */
export function formatNumber(num: number): string {
  const str = num.toString();
  let result = "";
  const [intPart, decPart] = str.split(".");

  if (intPart.length <= 3) {
    result = intPart;
  } else {
    result = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);
    while (remaining.length > 2) {
      result = remaining.slice(-2) + "," + result;
      remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) {
      result = remaining + "," + result;
    }
  }

  return decPart ? `${result}.${decPart}` : result;
}

/**
 * Generate a random room code (6 chars alphanumeric)
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate percentage with bounds
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Format player price for display
 */
export function formatPlayerPrice(priceInCrores: number): string {
  if (priceInCrores >= 1) {
    return `${priceInCrores.toFixed(2)} Cr`;
  }
  return `${(priceInCrores * 100).toFixed(0)} L`;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Delay helper for animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format time from seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
