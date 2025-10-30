import type { Category } from "@prisma/client"

export type CreateCategoryInput = Omit<CategoryDTO, "id">
export type CategoryDTO = Omit<Category, "userId" | "createdAt" | "updatedAt">
