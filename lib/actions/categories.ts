"use server"

// Next.js
import { revalidatePath } from "next/cache"

// Stack Auth
import { getCurrentUser } from "@/lib/auth/auth"

// Services
import {
  getCategoriesByUserId,
  deleteCategoryById,
  createCategory,
  updateCategory,
} from "@/lib/services/categories"

// Types
import type { ActionResult } from "@/lib/types/error"
import type { CreateCategoryInput, CategoryDTO } from "@/lib/types/category"

// Error Handling
import { withErrorHandling } from "@/lib/errors/with-error-handling"
import { AppError } from "@/lib/errors/app-error"

export interface CategoryCreateResult {
  message: string
  data?: CategoryDTO
  meta?: { userId: string }
}

export interface CategoryListResult {
  message: string
  data: CategoryDTO[]
  meta: { count: number; userId: string }
}

export interface CategoryUpdateResult {
  message: string
  meta?: { id: string; userId: string; updatedAt?: string }
}

export interface CategoryDeleteResult {
  message: string
  meta?: { id: string; userId: string }
}

// Create a new category (CRUD - Create)
export async function createCategoryAction(
  data: CreateCategoryInput
): Promise<ActionResult<CategoryCreateResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    const category = await createCategory(user.id, data)
    revalidatePath("/dashboard/category")
    return {
      message: "Category created successfully",
      data: category,
      meta: { userId: user.id },
    }
  })
}

// Get all categories for the current user (CRUD - Read)
export async function getAllCategories(): Promise<ActionResult<CategoryListResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    const categories = await getCategoriesByUserId(user.id)
    return {
      message: "Categories retrieved successfully",
      data: categories,
      meta: { count: categories.length, userId: user.id },
    }
  })
}

// Update an existing category (CRUD - Update)
export async function updateCategoryAction(
  id: string,
  data: Partial<CategoryDTO>
): Promise<ActionResult<CategoryUpdateResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    await updateCategory(user.id, id, data)
    revalidatePath("/dashboard/category")
    return {
      message: "Category updated successfully",
      meta: { id, userId: user.id, updatedAt: new Date().toISOString() },
    }
  })
}

// Delete category by ID (CRUD - Delete)
export async function deleteCategoryAction(
  id: string
): Promise<ActionResult<CategoryDeleteResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    await deleteCategoryById(user.id, id)
    revalidatePath("/dashboard/category")
    return {
      message: "Category deleted successfully",
      meta: { id, userId: user.id },
    }
  })
}
