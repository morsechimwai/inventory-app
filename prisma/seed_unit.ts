import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const demoUserId = "e584e73e-001a-429d-81ac-2d8dde57f266"

  const units = [
    "Piece",
    "Box",
    "Pack",
    "Kilogram",
    "Gram",
    "Liter",
    "Milliliter",
    "Meter",
    "Centimeter",
  ]

  await prisma.unit.createMany({
    data: units.map((name) => ({
      userId: demoUserId,
      name,
    })),
  })

  console.log("Unit seeding completed successfully!")
  console.log(`Created ${units.length} units for user ID: ${demoUserId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
