import http from "http";
import https from "https";

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

export function isValidUrl(url: string, callback: (valid: boolean) => void) {
  const client = url.startsWith("https") ? https : http;
  client
    .get(url, (res) => {
      const { statusCode } = res;

      if (!statusCode) {
        callback(false);
        return;
      }

      const isSuccessCode = statusCode >= 200 && statusCode < 400;
      callback(isSuccessCode);
    })
    .on("error", (_) => {
      callback(false);
    });
}
