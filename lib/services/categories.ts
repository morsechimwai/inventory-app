// lib/services/categories.ts

import { prisma } from "@/lib/db/prisma"
import type { CategoryDTO, CreateCategoryInput } from "@/lib/types/category"
import { AppError } from "../errors/app-error"

// Create a new category (CRUD - Create)
export async function createCategory(
  userId: string,
  data: CreateCategoryInput
): Promise<CategoryDTO> {
  try {
    return prisma.category.create({
      data: { ...data, userId },
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
  data: Partial<CategoryDTO>
): Promise<CategoryDTO> {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
    select: { id: true },
  })

  if (!existing) throw new AppError("NOT_FOUND", "Category not found.")

  try {
    return prisma.category.update({
      where: { id },
      data,
    })
  } catch {
    throw new AppError("DB_UPDATE_FAILED", "Failed to update category.", {
      id,
      data,
    })
  }
}

// Delete category by ID (CRUD - Delete)
export async function deleteCategoryById(userId: string, id: string): Promise<CategoryDTO> {
  const existing = await prisma.category.findFirst({
    where: { id, userId },
    select: { id: true },
  })

  if (!existing) throw new AppError("NOT_FOUND", "Category not found.")

  try {
    return await prisma.category.delete({ where: { id } })
  } catch {
    throw new AppError("DB_DELETE_FAILED", "Failed to delete category.", {
      id,
    })
  }
}
