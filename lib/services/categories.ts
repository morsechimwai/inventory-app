// lib/services/categories.ts

import { prisma } from "@/lib/db/prisma"

// Types
import type { CategoryEntity, CategoryInput, CategoryDTO } from "@/lib/types/category"

// Security
import { sanitizeInput } from "@/lib/security/sanitize"

// App error handling
import { AppError } from "../errors/app-error"

// Helper to assert category ownership
async function assertCategoryOwnership(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true },
  })

  if (!category) throw new AppError("NOT_FOUND", "Category not found.")
}

// Create a new category (CRUD - Create)
export async function createCategory(userId: string, data: CategoryInput): Promise<CategoryEntity> {
  try {
    // Sanitize input
    const cleanName = sanitizeInput(data.name)

    // Create category
    return prisma.category.create({
      data: { ...data, name: cleanName, userId },
    })
  } catch {
    throw new AppError("DB_CREATE_FAILED", "Failed to create category.", {
      data,
    })
  }
}

// Get category by user ID (CRUD - Read)
export async function getCategoriesByUserId(userId: string): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return categories
}

// Update an existing category (CRUD - Update)
export async function updateCategory(
  userId: string,
  id: string,
  data: Partial<CategoryInput>
): Promise<CategoryEntity> {
  try {
    // Ensure the category belongs to the user
    await assertCategoryOwnership(userId, id)

    // Sanitize input
    const cleanName = data.name ? sanitizeInput(data.name) : undefined

    // Update category
    return prisma.category.update({
      where: { id },
      data: { ...data, name: cleanName },
    })
  } catch {
    throw new AppError("DB_UPDATE_FAILED", "Failed to update category.", {
      id,
      data,
    })
  }
}

// Delete category by ID (CRUD - Delete)
export async function deleteCategoryById(userId: string, id: string): Promise<CategoryEntity> {
  try {
    // Ensure the category belongs to the user
    await assertCategoryOwnership(userId, id)
    return await prisma.category.delete({ where: { id } })
  } catch {
    throw new AppError("DB_DELETE_FAILED", "Failed to delete category.", {
      id,
    })
  }
}
