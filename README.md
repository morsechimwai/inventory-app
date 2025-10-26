# Inventory App

ระบบจัดการสต็อกและสินค้าสำหรับทีมธุรกิจที่ต้องการเห็นภาพรวมของสินค้า คำสั่งซื้อ และสถานะการเติมสินค้าแบบเรียลไทม์ สร้างด้วย Next.js 16 + App Router

> **สถานะโปรเจกต์:** กำลังพัฒนา – โครงสร้างพื้นฐาน (UI, Prisma, Stack authentication) ถูกเตรียมไว้และกำลังต่อยอดฟีเจอร์หลัก

## คุณสมบัติ (ระยะสั้น)
- แดชบอร์ดสรุปสินค้าคงคลัง รายการสินค้า และคำสั่งซื้อ
- Workflow สำหรับรับเข้า/ตัดออกสต็อก พร้อมบันทึกเหตุผลการแก้ไข
- สิทธิ์การใช้งานผ่าน Stack (multi-tenant ready)
- ฐานข้อมูล PostgreSQL เชื่อมด้วย Prisma Client

## Tech Stack
- Next.js 16 (App Router, Server Components, Metadata API)
- React 19 + TypeScript
- Tailwind CSS 4 + tw-animate สำหรับ design system
- Prisma ORM + PostgreSQL (`DATABASE_URL`)
- Stack SDK (`@stackframe/stack`) สำหรับ auth/session management
- Lucide icons, class-variance-authority, tailwind-merge

## โครงสร้างโฟลเดอร์ย่อ
```
app/                 // หน้า App Router (dashboard, handlers, loading states)
components/          // UI ที่ใช้ซ้ำได้ เช่น Sidebar, Cards
lib/generated/       // Prisma Client (สร้างอัตโนมัติหลัง migrate)
prisma/              // schema และ migrations
stack/               // การตั้งค่าที่เกี่ยวข้องกับ Stack SDK
```

## การเริ่มต้นใช้งาน
1. ติดตั้ง dependencies
   ```bash
   pnpm install
   ```
2. สร้างไฟล์ environment (`.env.local` หรือ `.env`) และกำหนดค่าอย่างน้อย:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
   STACK_API_KEY="..."
   STACK_PROJECT_ID="..."
   ```
3. สร้างฐานข้อมูลและ Prisma Client
   ```bash
   pnpm dlx prisma migrate dev
   ```
4. รันเซิร์ฟเวอร์พัฒนา
   ```bash
   pnpm dev
   ```
5. เปิด http://localhost:3000 เพื่อลองใช้งาน

## สคริปต์ที่มีให้
| สคริปต์            | คำอธิบาย                                   |
|--------------------|---------------------------------------------|
| `pnpm dev`         | รัน Next.js development server              |
| `pnpm build`       | สร้าง production build                      |
| `pnpm start`       | รัน production server จาก `.next`           |
| `pnpm lint`        | ตรวจสอบโค้ดด้วย ESLint                     |

## Roadmap ถัดไป
- เชื่อมต่อ UI กับเลเยอร์ข้อมูลจริง (products, warehouses, suppliers)
- เพิ่ม role-based access control และ activity log
- อินทิเกรตการแจ้งเตือน (webhook / email) เมื่อสต็อกต่ำ
- ปรับ UI ให้รองรับ mobile-first

## License
โปรเจกต์นี้อยู่ภายใต้สัญญาอนุญาต MIT (ดูไฟล์ `LICENSE`)
