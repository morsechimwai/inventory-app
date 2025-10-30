import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const demoUserId = "e584e73e-001a-429d-81ac-2d8dde57f266"

  const categories = [
    "Office Supplies",
    "Electronics",
    "Beverages",
    "Snacks",
    "Cleaning Products",
    "Furniture",
    "Tools",
    "Raw Materials",
    "Cosmetics",
    "Other",
  ]

  await prisma.category.createMany({
    data: categories.map((name) => ({
      userId: demoUserId,
      name,
    })),
  })

  console.log("Category seeding completed successfully!")
  console.log(`Created ${categories.length} categories for user ID: ${demoUserId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
