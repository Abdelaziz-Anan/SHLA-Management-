import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cached module-level formatters to eliminate repeated allocations and GC overhead
const egpNumberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatCurrency(amount: number, currency: string = "EGP"): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `0 ${currency}`;
  return `${egpNumberFormatter.format(amount)} ${currency}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return dateFormatter.format(d);
  } catch (e) {
    return dateString;
  }
}

export function getPaymentStatus(coursePrice: number, totalPaid: number): 'Not Paid' | 'Partially Paid' | 'Fully Paid' | 'Overpaid' {
  if (totalPaid <= 0) return 'Not Paid';
  if (totalPaid < coursePrice) return 'Partially Paid';
  if (totalPaid === coursePrice) return 'Fully Paid';
  return 'Overpaid';
}
