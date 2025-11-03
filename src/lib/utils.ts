import { clsx, type ClassValue } from "clsx";
import { FirebaseError } from "firebase/app";
import { AuthErrorCodes } from "firebase/auth";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = "USD", locale = "en-US", minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}

export function toastError(error: unknown) {
  console.error(error);

  let message = "Something went wrong.";

  if (error instanceof FirebaseError) {
    if (error.code === AuthErrorCodes.INTERNAL_ERROR) {
      message = error.message;
    } else if (error.code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS) {
      message = "Invalid username or password";
    } else if (error.code === AuthErrorCodes.POPUP_CLOSED_BY_USER) {
      message = "Login cancelled by user.";
    } else {
      message = error.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  toast.error(message);
}

export function formatISODate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remMinutes = minutes % 60;
    return `${hours}h${remMinutes > 0 ? ` ${remMinutes}m` : ""}`;
  }

  if (minutes > 0) {
    const remSeconds = seconds % 60;
    return `${minutes}m${remSeconds > 0 ? ` ${remSeconds}s` : ""}`;
  }

  return `${seconds}s`;
}
