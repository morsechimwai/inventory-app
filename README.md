# Inventory App

An inventory management system for business teams that need a real-time overview of products, purchase orders, and restock status. Built on Next.js 16 with the App Router architecture.

> **Project status:** In development — core foundations (UI, Prisma, Stack authentication) are scaffolded and core features are in progress.

## Near-term Features
- Dashboard that summarizes current inventory, product lists, and orders
- Workflows for receiving and issuing stock with audit-ready adjustment notes
- Authentication and tenancy powered by Stack
- PostgreSQL database access through Prisma Client

## Tech Stack
- Next.js 16 (App Router, Server Components, Metadata API)
- React 19 + TypeScript
- Tailwind CSS 4 + tw-animate for the design system
- Prisma ORM + PostgreSQL (`DATABASE_URL`)
- Stack SDK (`@stackframe/stack`) for auth/session management
- Lucide icons, class-variance-authority, tailwind-merge

## Project Structure (short version)
```
app/                 // App Router pages (dashboard, handlers, loading states)
components/          // Reusable UI pieces such as sidebar and cards
lib/generated/       // Prisma Client (generated after running migrations)
prisma/              // Schema definition and migrations
stack/               // Stack SDK configuration
```

## Getting Started
1. Install dependencies
   ```bash
   pnpm install
   ```
2. Create an environment file (`.env.local` or `.env`) and define at least:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"
   STACK_API_KEY="..."
   STACK_PROJECT_ID="..."
   ```
3. Prepare the database and generate Prisma Client
   ```bash
   pnpm dlx prisma migrate dev
   ```
4. Start the development server
   ```bash
   pnpm dev
   ```
5. Open http://localhost:3000 to explore the UI

## Available Scripts
| Script        | Description                              |
|---------------|------------------------------------------|
| `pnpm dev`    | Run the Next.js development server       |
| `pnpm build`  | Produce a production build               |
| `pnpm start`  | Serve the production build from `.next`  |
| `pnpm lint`   | Lint the codebase with ESLint            |

## Roadmap
- Bind the UI to real data models (products, warehouses, suppliers)
- Add role-based access control and activity logging
- Integrate webhooks/email alerts for low-stock events
- Polish the UI for a mobile-first experience

## License
Released under the MIT License (see `LICENSE`).
