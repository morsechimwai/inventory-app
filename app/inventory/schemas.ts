import z from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Product Name is required" }),
  sku: z
    .string()
    .trim()
    .transform((value) => (value.length ? value : undefined))
    .optional(),
  price: z.preprocess(
    (v) => (v === "" ? undefined : Number(v)),
    z
      .number({ message: "Price is required" })
      .min(0, { message: "Price must be at least 0" })
      .max(9999999999.99, {
        message: "Price must be less than 10,000,000,000.00",
      })
  ),
  quantity: z.preprocess(
    (v) => (v === "" ? undefined : Number(v)),
    z
      .number({ message: "Quantity is required" })
      .int({ message: "Quantity must be an integer" })
      .min(0, { message: "Quantity must be at least 0" })
      .max(9999999999, { message: "Quantity must be less than 10,000,000,000" })
  ),
  lowStockAt: z.preprocess(
    (v) => (v === "" ? undefined : Number(v)),
    z
      .number({ message: "Low stock must be a number" })
      .int({ message: "Low stock must be an integer" })
      .min(0, { message: "Low stock must be at least 0" })
      .max(9999999999, {
        message: "Low stock must be less than 10,000,000,000",
      })
      .optional()
  ),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const defaultFormValues: ProductFormValues = {
  name: "",
  sku: undefined,
  price: 0,
  quantity: 0,
  lowStockAt: undefined,
};
