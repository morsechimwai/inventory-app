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

## Roadmap
- Sync dashboard metrics with live inbound/outbound stock transactions
- Introduce role-based access control and audit logging
- Enable supplier management, purchase orders, and transfer workflows
- Add alerting (webhooks/email) for low stock and stockouts
- Polish responsive UX and accessibility coverage

## Contributing & license
Pull requests, issues, and feature ideas are welcome. microFeed ships under the [MIT License](./LICENSE), so you can adapt it for commercial products, internal tools, or SaaS offerings without friction.

Own your feed. Let your team share updates on your terms.
