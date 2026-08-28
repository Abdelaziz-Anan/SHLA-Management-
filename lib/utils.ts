import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "EGP"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "EGP" ? "EGP" : "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace("EGP", "") + " EGP";
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
