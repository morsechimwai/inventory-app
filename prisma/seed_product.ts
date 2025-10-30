import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

async function main() {
  const demoUserId = "e584e73e-001a-429d-81ac-2d8dde57f266"

  // Get seeded units & categories
  const units = await prisma.unit.findMany({ where: { userId: demoUserId } })
  const categories = await prisma.category.findMany({ where: { userId: demoUserId } })

  if (units.length === 0 || categories.length === 0) {
    throw new Error("Units or Categories not found. Seed them first.")
  }

  const products = Array.from({ length: 20 }).map((_, i) => {
    const unit = faker.helpers.arrayElement(units)
    const category = faker.helpers.arrayElement(categories)

    return {
      userId: demoUserId,
      name: faker.commerce.productName(),
      sku: `SKU-${faker.string.alphanumeric(6).toUpperCase()}`,
      lowStockAt: faker.number.int({ min: 3, max: 10 }),
      categoryId: category.id,
      unitId: unit.id,
      createdAt: faker.date.recent({ days: 60 }),
    }
  })

  await prisma.product.createMany({ data: products })

  console.log("✅ Product seeding completed!")
  console.log(`Created ${products.length} products for user: ${demoUserId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
