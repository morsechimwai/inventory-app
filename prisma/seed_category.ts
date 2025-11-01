import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const demoUserId = "e584e73e-001a-429d-81ac-2d8dde57f266"

  const categories = [
    "อาหารแห้ง",
    "อาหารสด",
    "เครื่องดื่ม",
    "ขนมขบเคี้ยว",
    "อุปกรณ์สำนักงาน",
    "อุปกรณ์ไฟฟ้า",
    "เครื่องใช้ไฟฟ้า",
    "เครื่องสำอาง",
    "ผลิตภัณฑ์ทำความสะอาด",
    "ของใช้ในบ้าน",
    "อุปกรณ์ก่อสร้าง",
    "เครื่องมือช่าง",
    "วัตถุดิบ",
    "บรรจุภัณฑ์",
    "ของใช้ส่วนตัว",
    "เครื่องครัว",
    "ของเล่น",
    "เฟอร์นิเจอร์",
    "อะไหล่",
    "อื่นๆ",
  ]

  await prisma.category.createMany({
    data: categories.map((name) => ({
      userId: demoUserId,
      name,
    })),
    skipDuplicates: true,
  })

  console.log("✅ Category seeding completed")
  console.log(`Inserted or skipped: ${categories.length} categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
