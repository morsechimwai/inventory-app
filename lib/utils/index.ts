import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Normalize input: convert empty strings to null
export const toStringOrNull = (v: unknown) => (v === "" || v == null ? null : String(v))
export const toNumberOrNull = (v: unknown) => (v === "" || v == null ? null : Number(v))

// Format number as Thai Baht currency
export function formatCurrencyTHB(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format number as Thai Baht currency text without symbol
export function formatCurrencyTHBText(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${formatted} THB`
}
