# 🦜 stocKit

<!-- PROJECT LOGO -->
<p align="center">
  <a href="#">
    <img src="public/icon.png" alt="stocKit Logo" width="120" height="120">
  </a>
</p>

A Stack-authenticated inventory management workspace built with Next.js 16. It lets small teams monitor stock, surface low inventory, and manage product records from a single dashboard.

> **Project status:** In development — dashboard analytics and inventory CRUD flows are live; integrations such as alerts and role management are still in progress.

## Feature Highlights
- Secure workspace powered by Stack authentication with protected routes and user-scoped Prisma queries.
- Inventory manager with server actions for create/update/delete, `react-hook-form` + `zod` validation, toast feedback, sheets and dialogs, and empty/loading states.
- Analytics dashboard that calculates stock KPIs, renders recent product activity with Recharts, and visualizes efficiency using a radial chart.
- Responsive layout with an off-canvas sidebar, breadcrumb header, skeleton placeholders, and reusable UI primitives.
- Prisma-backed PostgreSQL data model for per-user products, with `revalidatePath` ensuring UI freshness after mutations.

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
| movementType* | `MovementType`       | Enum describing IN, OUT, or ADJUST movements                          |
| quantity*     | `Decimal(12,3)`      | Quantity moved                                                        |
| unitCost      | `Decimal(12,2)?`     | Optional per-unit cost at movement time                               |
| totalCost     | `Decimal(14,2)?`     | Optional aggregate cost                                               |
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
- `MovementType`: `IN`, `OUT`, `ADJUST`
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

## Analytics Formulae
The dashboard’s trending and efficiency widgets are computed with deterministic transforms so you always know what the numbers mean.[^1][^2]

### Weekly Trending
We split products into disjoint week-long buckets.

Let `W0` = current ISO week, `W-1` = prior week.

Define Trend(a,b):

![trend](https://latex.codecogs.com/png.image?\dpi{150}\operatorname{Trend}(a,b)=\begin{cases}\frac{a-b}{b}\times100&\text{if }b>0,\\0&\text{otherwise}\end{cases})

Dashboard signals:

![signals](https://latex.codecogs.com/png.image?\dpi{150}T_{prod}=\operatorname{Trend}(|W_0|,|W_{-1}|),\quad
T_{value}=\operatorname{Trend}(\sum_{p\in W_0}price_p\cdot qty_p,\sum_{p\in W_{-1}}price_p\cdot qty_p),\quad
T_{low}=\operatorname{Trend}(|L_0|,|L_{-1}|))

`L_t` = { products in `W_t` with qty ≤ 5 }.

### Inventory Efficiency Score
Let `N` = total product count.

Percent buckets:

![percent](https://latex.codecogs.com/png.image?\dpi{150}P_{in}=\frac{N_{in}}{N}\times100,\quad
P_{low}=\frac{N_{low}}{N}\times100,\quad
P_{out}=\frac{N_{out}}{N}\times100)

Counts:

- `N_in`: qty > 5
- `N_low`: 1 < qty ≤ 5
- `N_out`: qty = 0

Efficiency:

![eff](https://latex.codecogs.com/png.image?\dpi{150}E=\operatorname{clip}_{[0,100]}(\operatorname{round}(0.7P_{in}+0.2(100-P_{low})+0.1(100-P_{out}))))


## Contributing & license
Pull requests, issues, and feature ideas are welcome. microFeed ships under the [MIT License](./LICENSE), so you can adapt it for commercial products, internal tools, or SaaS offerings without friction.

Own your feed. Let your team share updates on your terms.

[^1]: Stevenson, W. J. (2020). *Operations Management* (14th ed.). McGraw-Hill Education.
[^2]: Silver, E. A., Pyke, D. F., & Thomas, D. J. (2017). *Inventory and Production Management in Supply Chains* (4th ed.). CRC Press.
[^3]: Kaplan, R. S., & Norton, D. P. (1996). *The Balanced Scorecard: Translating Strategy into Action*. Harvard Business School Press.
