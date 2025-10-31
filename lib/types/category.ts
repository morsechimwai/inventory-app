import type { Category } from "@prisma/client"

// Entity
export type CategoryEntity = Category

// Form input
export type CategoryInput = {
  name: string
}

// DTO for output
export type CategoryDTO = {
  id: string
  name: string
}
