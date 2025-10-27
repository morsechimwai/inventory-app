"use server";

import { revalidatePath } from "next/cache";
import {
  getProductsByUserId,
  deleteProductById,
  createProduct,
  updateProduct,
} from "@/lib/services/products";
import { withErrorHandling } from "@/lib/utils/withErrorHandling";
import type { ActionResult } from "@/lib/types";
import type { CreateProductInput, ProductDTO } from "@/lib/types/product";
import { getCurrentUser } from "@/lib/auth/auth";

// Fetch all products for the current user
export async function getAllProducts(): Promise<ActionResult<ProductDTO[]>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const products = await getProductsByUserId(user.id);
    return products;
  });
}

// Delete a product by ID
export async function deleteProductAction(
  id: string
): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await deleteProductById(user.id, id);
    revalidatePath("/inventory");
  });
}

// Create a new product
export async function createProductAction(
  data: CreateProductInput
): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await createProduct(user.id, data);
    revalidatePath("/inventory");
  });
}

// Update an existing product
export async function updateProductAction(
  id: string,
  data: Partial<ProductDTO>
): Promise<ActionResult<void>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await updateProduct(user.id, id, data);
    revalidatePath("/inventory");
  });
}
