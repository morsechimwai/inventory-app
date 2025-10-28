import { Prisma } from "@prisma/client";
import type { ActionResult } from "@/lib/types";
import { AppError } from "./app-error";

// central known error messages
const PRISMA_ERROR_MESSAGES: Record<string, string> = {
  P2002: "This value already exists. Please choose another one.",
  P2003: "Cannot delete this item because it’s linked to other data.",
  P2025: "Item not found or may have been deleted.",
  P2014: "Invalid relation detected. Please check linked data.",
};

export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: unknown) {
    console.error("[withErrorHandling] Caught error:", error);

    // Prisma known request error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const message =
        PRISMA_ERROR_MESSAGES[error.code] ||
        `Database request failed (${error.code})`;

      return {
        success: false,
        code: error.code,
        meta: error.meta ?? {},
        errorMessage: message,
      };
    }

    // Prisma validation or connection errors
    if (
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientInitializationError
    ) {
      return {
        success: false,
        code: "DB_VALIDATION_ERROR",
        meta: { stack: (error as Error).stack },
        errorMessage:
          "Invalid data or failed to initialize database connection.",
      };
    }

    // Prisma engine crash
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return {
        success: false,
        code: "DB_ENGINE_CRASH",
        meta: { stack: (error as Error).stack },
        errorMessage: "Database engine crashed. Please restart server.",
      };
    }

    // Auth errors or logical (user-defined)
    if ((error as { code?: string }).code === "UNAUTHORIZED") {
      return {
        success: false,
        code: "UNAUTHORIZED",
        errorMessage: "You are not authorized to perform this action.",
      };
    }

    // Network / fetch errors
    if (
      error instanceof TypeError &&
      (error as TypeError & { cause?: string }).cause === "network"
    ) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        errorMessage: "Network connection failed.",
      };
    }

    // Application-specific errors
    if (error instanceof AppError) {
      return {
        success: false,
        code: error.code,
        meta: error.meta ?? {},
        errorMessage: error.message,
      };
    }

    // Fallback: generic unknown error
    const fallbackMessage =
      error instanceof Error
        ? error.message || "Unknown error occurred"
        : "Unexpected system error";

    return {
      success: false,
      code: "UNKNOWN_ERROR",
      meta:
        error instanceof Error
          ? { stack: error.stack }
          : { detail: JSON.stringify(error) },
      errorMessage: fallbackMessage,
    };
  }
}
