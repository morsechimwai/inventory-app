# StocKit

<!-- PROJECT LOGO -->
<p align="center">
  <a href="#">
    <img src="public/icon.png" alt="StocKit Logo" width="120" height="120">
  </a>
</p>

 A Stack-authenticated inventory management workspace built with Next.js 16. It lets small teams monitor stock, surface low inventory, and manage product records from a single dashboard.

> **Project status:** In development — dashboard analytics and inventory CRUD flows are live; integrations such as alerts and role management are still in progress.

## Feature Highlights
- Secure workspace powered by Stack authentication with protected routes and user-scoped Prisma queries.
- Inventory manager with server actions for create/update/delete, `react-hook-form` + `zod` validation, toast feedback, sheets and dialogs, and empty/loading states.
- Moving Average Cost engine keeps `Product.currentStock` and `Product.avgCost` in sync so OUT movements price automatically while IN movements recompute weighted-average cost.
- Insights-driven dashboard surfacing KPI tiles, live stock health, restock cues, efficiency scoring, weekly product trends, and recent inventory movements.
- Responsive layout with an off-canvas sidebar, breadcrumb header, skeleton placeholders, and reusable UI primitives.
- Prisma-backed PostgreSQL data model for per-user products, with `revalidatePath` ensuring UI freshness after mutations.

## Dashboard Insights
- Key metrics tile trio covering total products, low-stock count, and total inventory value with week-over-week trend indicators.
- Stock health list with traffic-light status strip, live quantity gauge, and quick restock action for risky items.
- Restock suggestions highlighting reorder thresholds plus recommended purchase quantities.
- Efficiency radial chart summarizing in-stock, low-stock, and out-of-stock percentages alongside the overall efficiency score.
- Weekly product chart visualising new additions across the last 12 weeks.
- Recent activity feed detailing the latest stock movements with type, reason, quantity, and relative timestamps.

## Tech Stack
- Next.js 16 (App Router, Server Components, Route Handlers)
- React 19 + TypeScript
- Tailwind CSS 4 + tw-animate
- Prisma ORM + PostgreSQL (`DATABASE_URL`)
- Stack SDK (`@stackframe/stack`) for auth/session management
- Recharts, react-hook-form, zod, sonner, class-variance-authority, tailwind-merge, Lucide icons

## Directory Overview
```
app/                      // Landing page, dashboard, inventory, settings, Stack handler
components/               // Shared UI (sidebar, header, tables, charts, skeletons)
lib/actions/              // Server actions wrapping service-layer operations
lib/services/             // Prisma-backed domain services
lib/types/                // Shared DTOs and helpers
stack/                    // Stack client/server configuration
prisma/                   // Schema, migrations, seed script
public/                   // Static assets
```

## Stock Movements Service
- Core service logic lives in `lib/services/stock-movements.ts`, where each create/update/delete runs inside a Prisma transaction and delegates pricing + stock math to the MAC helpers.
- Ownership enforcement (`assertProductOwnership`) ensures a user can only mutate their own products, even inside nested transactions.
- Pure Moving Average Cost math sits in `lib/services/stock-movement-math.ts` with Vitest coverage at `lib/services/__tests__/stock-movement-math.test.ts`, making it straightforward to evolve costing rules without touching Prisma code.

## Dashboard Efficiency Formula
- We calculate `efficiencyScore` in [`lib/utils/dashboard.ts`](lib/utils/dashboard.ts) by first deriving the product distribution:
  - `inStockPercentage = round((inStockCount / totalProducts) × 100)`
  - `lowStockPercentage = round((lowStockCount / totalProducts) × 100)`
  - `outOfStockPercentage = round((outOfStockCount / totalProducts) × 100)`
- The final score blends these with weighted penalties and clamps between 0–100:

  ```
  efficiencyScore = round(
    clamp(
      (inStockPercentage × 0.7) +
      ((100 − lowStockPercentage) × 0.2) +
      ((100 − outOfStockPercentage) × 0.1),
      0,
      100
    )
  )
  ```

- If there are no products (`totalProducts = 0`), the score is reported as `null`.

## Database Schema
Prisma models are scoped by `userId` so each Stack-authenticated workspace owns its own catalogue. Columns marked `*` are required.

### Product
| Column*        | Type                 | Notes                                                       |
|----------------|----------------------|-------------------------------------------------------------|
| id*            | `String`             | Primary key generated with `cuid()`                        |
| userId*        | `String`             | Foreign key to Stack user; drives row-level isolation      |
| name*          | `String`             | Product display name                                        |
| sku            | `String?`            | User-scoped unique constraint with `userId`                |
| lowStockAt     | `Int?`               | Optional threshold that triggers low stock warnings       |
| categoryId     | `String?`            | Nullable FK to `Category` (`@db.VarChar(255)`)             |
| unitId*        | `String`             | Required FK to `Unit` (`@db.VarChar(255)`)                 |
| currentStock*  | `Decimal(12,3)`      | Cached on-hand quantity, defaults to `0`                   |
| avgCost*       | `Decimal(12,2)`      | Cached moving-average cost, defaults to `0`                |
| createdAt*     | `DateTime`           | Defaults to `now()`                                         |
| updatedAt*     | `DateTime`           | Auto-updated timestamp                                      |

**Indexes**
- `@@unique([userId, sku])`
- `@@index([userId, name])`
- `@@index([createdAt])`

**Relations**
- Optional `category` via `categoryId`
- Required `unit` via `unitId`
- One-to-many `movements`

### Category
| Column*    | Type        | Notes                                                   |
|------------|-------------|---------------------------------------------------------|
| id*        | `String`    | Primary key generated with `cuid()`                    |
| userId*    | `String`    | Stack user owner                                        |
| name*      | `String`    | User-scoped unique category name                        |
| createdAt* | `DateTime`  | Defaults to `now()`                                     |
| updatedAt* | `DateTime`  | Auto-updated timestamp                                  |

**Indexes**
- `@@unique([userId, name])`
- `@@index([userId])`

**Relations**
- One-to-many `products`

### Unit
| Column*    | Type        | Notes                                                   |
|------------|-------------|---------------------------------------------------------|
| id*        | `String`    | Primary key generated with `cuid()`                    |
| userId*    | `String`    | Stack user owner                                        |
| name*      | `String`    | Display label such as "กล่อง", "กิโลกรัม"             |
| createdAt* | `DateTime`  | Defaults to `now()`                                     |
| updatedAt* | `DateTime`  | Auto-updated timestamp                                  |

**Indexes**
- `@@unique([userId, name])`
- `@@index([userId])`

**Relations**
- One-to-many `products`

### StockMovement
| Column*       | Type                 | Notes                                                                 |
|---------------|----------------------|-----------------------------------------------------------------------|
| id*           | `String`             | Primary key generated with `cuid()`                                  |
| productId*    | `String`             | FK to `Product`                                                       |
| userId*       | `String`             | Stack user owner                                                      |
| movementType* | `MovementType`       | Enum describing IN or OUT movements (Adjustment reserved for future use) |
| quantity*     | `Decimal(12,3)`      | Quantity moved                                                        |
| unitCost      | `Decimal(12,2)?`     | Per-unit cost persisted for history; IN requires input, OUT auto-uses the product average |
| totalCost     | `Decimal(14,2)?`     | Calculated as `quantity × unitCost`                                     |
| referenceType | `ReferenceType`      | Defaults to `MANUAL`                                                  |
| referenceId   | `String?`            | Optional document identifier                                          |
| reason        | `String?`            | Optional adjustment reason                                            |
| createdAt*    | `DateTime`           | Defaults to `now()`                                                   |
| updatedAt*    | `DateTime`           | Auto-updated timestamp                                                |

**Indexes**
- `@@index([productId])`
- `@@index([createdAt])`
- `@@index([movementType, createdAt])`
- `@@index([referenceType, referenceId])`
- `@@index([userId, createdAt])`
- `@@index([productId, movementType])`
- `@@index([productId, createdAt])`

**Relations**
- Belongs to `product`

### Enums
- `MovementType`: `IN`, `OUT` *(Adjustment reserved for future release)*
- `ReferenceType`: `PURCHASE`, `SALE`, `RETURN`, `TRANSFER`, `ADJUSTMENT`, `MANUAL`

## Prerequisites
- Node.js 20+
- pnpm
- PostgreSQL database
- Stack account with project keys (https://stackauth.com)

## Environment Variables
Create `.env.local` (or `.env`) with the following values using your own credentials:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
NEXT_PUBLIC_STACK_PROJECT_ID="<your-stack-project-id>"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="<your-stack-publishable-client-key>"
STACK_SECRET_SERVER_KEY="<your-stack-server-key>"
```

The optional `prisma/seed.ts` script references a demo user ID—adjust it if you seed sample data.

## Getting Started
1. Install dependencies
   ```bash
   pnpm install
   ```
2. Apply database migrations and generate Prisma Client
   ```bash
   pnpm dlx prisma migrate dev
   ```
3. (Optional) Seed demo data after configuring Prisma's seed command to run `prisma/seed.ts`.
4. Start the development server
   ```bash
   pnpm dev
   ```
5. Open http://localhost:3000 and sign in with Stack to access the dashboard and inventory screens.

## Available Scripts
| Script        | Description                              |
|---------------|------------------------------------------|
| `pnpm dev`    | Run the Next.js development server       |
| `pnpm build`  | Produce a production build               |
| `pnpm start`  | Serve the production build from `.next`  |
| `pnpm lint`   | Lint the codebase with ESLint            |

## Contributing & license
Pull requests, issues, and feature ideas are welcome. microFeed ships under the [MIT License](./LICENSE), so you can adapt it for commercial products, internal tools, or SaaS offerings without friction.

Own your feed. Let your team share updates on your terms.
