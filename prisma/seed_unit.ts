import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const demoUserId = "e584e73e-001a-429d-81ac-2d8dde57f266"

  // หน่วยภาษาไทยล้วน แบบใช้จริงใน inventory
  const units = [
    "ชิ้น",
    "กล่อง",
    "แพ็ค",
    "ถุง",
    "ชุด",
    "ลัง",
    "แผง",
    "ซอง",
    "ขวด",
    "ถัง",
    "แกลลอน",
    "โหล",
    "กิโลกรัม",
    "กรัม",
    "ลิตร",
    "มิลลิลิตร",
    "เมตร",
    "เซนติเมตร",
    "แผ่น",
    "ใบ",
    "เล่ม",
    "ตลับ",
    "ม้วน",
    "แท่ง",
    "ช่อ",
    "ดอก",
    "เส้น",
    "ห่อ",
    "คู่",
    "ตัว",
  ]

  await prisma.unit.createMany({
    data: units.map((name) => ({
      userId: demoUserId,
      name,
    })),
    skipDuplicates: true,
  })

  console.log(`✅ Seeded ${units.length} Thai units`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
