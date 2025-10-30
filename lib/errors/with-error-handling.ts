// Types
import type { ActionResult } from "@/lib/types/error"

// Prisma Client
import { Prisma } from "@prisma/client"

// Application-specific errors
import { AppError } from "./app-error"

// Friendly Prisma error messages
const PRISMA_ERROR_MESSAGES: Record<string, string> = {
  P2002: "This value already exists. Please choose another one.",
  P2003: "Cannot delete this item because it's linked to other data.",
  P2025: "Item not found or may have been deleted.",
  P2014: "Invalid relation detected. Please check linked data.",
}

export async function withErrorHandling<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error: unknown) {
    console.error("[withErrorHandling] Caught error:", error)

    // Network / fetch errors
    if (
      error instanceof TypeError &&
      (error as TypeError & { cause?: string }).cause === "network"
    ) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        errorMessage: "Network connection failed.",
      }
    }

    // Prisma engine crash
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return {
        success: false,
        code: "DB_ENGINE_CRASH",
        meta: { stack: (error as Error).stack },
        errorMessage: "Database engine crashed. Please restart server.",
      }
    }

    // Prisma initialization errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        success: false,
        code: "DB_CONNECTION_ERROR",
        errorMessage: "Failed to connect to the database.",
        meta: { stack: error.stack },
      }
    }

    // Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      return {
        success: false,
        code: "PRISMA_VALIDATION_ERROR",
        errorMessage: "Invalid Prisma query or schema mismatch.",
        meta: { stack: error.stack },
      }
    }

    // Prisma known request error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const message = PRISMA_ERROR_MESSAGES[error.code] || `Database request failed (${error.code})`
      return {
        success: false,
        code: error.code,
        meta: error.meta ?? {},
        errorMessage: message,
      }
    }

    // Auth errors or logical (user-defined)
    if ((error as { code?: string }).code === "UNAUTHORIZED") {
      return {
        success: false,
        code: "UNAUTHORIZED",
        errorMessage: "You are not authorized to perform this action.",
      }
    }

    // Application-specific errors
    if (error instanceof AppError) {
      return {
        success: false,
        code: error.code,
        meta: error.meta ?? {},
        errorMessage: error.message,
      }
    }

    // Fallback: generic unknown error
    const fallbackMessage =
      error instanceof Error ? error.message || "Unknown error occurred" : "Unexpected system error"

    return {
      success: false,
      code: "UNKNOWN_ERROR",
      meta: error instanceof Error ? { stack: error.stack } : { detail: JSON.stringify(error) },
      errorMessage: fallbackMessage,
    }
  }
}
