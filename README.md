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

## 🤓 Analytics Formulae (Nerd Mode)
The dashboard’s trending and efficiency widgets are computed with deterministic transforms so you always know what the numbers mean.[^1][^2]

### Weekly Trending
We split products into disjoint week-long buckets. Let $\mathcal{W}_0$ be the set of records created during the current ISO week and $\mathcal{W}_{-1}$ the prior week. Define a generic percent-change helper
$$
\operatorname{Trend}(a,b)=
\begin{cases}
\dfrac{a-b}{b}\times 100 & \text{if } b>0,\\[6pt]
0 & \text{otherwise,}
\end{cases}
$$
which avoids division by zero when no products landed in the comparison window.

The three trend signals shown on the dashboard are:
$$
\begin{aligned}
T_{\text{prod}} &= \operatorname{Trend}\!\left(\lvert\mathcal{W}_0\rvert,\lvert\mathcal{W}_{-1}\rvert\right), \\
T_{\text{value}} &= \operatorname{Trend}\!\left(\sum_{p\in\mathcal{W}_0}\mathrm{price}_p \cdot \mathrm{qty}_p,\sum_{p\in\mathcal{W}_{-1}}\mathrm{price}_p \cdot \mathrm{qty}_p\right), \\
T_{\text{low}} &= \operatorname{Trend}\!\left(\lvert\mathcal{L}_0\rvert,\lvert\mathcal{L}_{-1}\rvert\right),
\end{aligned}
$$
where $\mathcal{L}_t=\{p\in\mathcal{W}_t\mid \mathrm{qty}_p\leq 5\}$ captures low-inventory products tracked against the five-unit service-level threshold.[^2]

### Inventory Efficiency Score
Let $N$ be the total product count for the signed-in workspace and define category percentages
$$
\begin{aligned}
P_{\text{in}} &= \frac{N_{\text{in}}}{N}\times 100, \\
P_{\text{low}} &= \frac{N_{\text{low}}}{N}\times 100, \\
P_{\text{out}} &= \frac{N_{\text{out}}}{N}\times 100,
\end{aligned}
$$
with $N_{\text{in}}=\lvert\{p\mid \mathrm{qty}_p>5\}\rvert$, $N_{\text{low}}=\lvert\{p\mid 1<\mathrm{qty}_p\leq 5\}\rvert$, and $N_{\text{out}}=\lvert\{p\mid \mathrm{qty}_p=0\}\rvert$. The efficiency widget renders
$$
E = \operatorname{clip}_{[0,100]}\!\left(\operatorname{round}\left(0.7\,P_{\text{in}} + 0.2\,(100-P_{\text{low}}) + 0.1\,(100-P_{\text{out}})\right)\right),
$$
assigning more weight to healthy stock while still rewarding reductions in low or empty bins. The $\operatorname{clip}$ operator bounds the score between 0 and 100, and $\operatorname{round}$ matches JavaScript's midpoint-away-from-zero rounding for legible UX.[^3]

## Roadmap
- Sync dashboard metrics with live inbound/outbound stock transactions
- Introduce role-based access control and audit logging
- Enable supplier management, purchase orders, and transfer workflows
- Add alerting (webhooks/email) for low stock and stockouts
- Polish responsive UX and accessibility coverage

## Contributing & license
Pull requests, issues, and feature ideas are welcome. microFeed ships under the [MIT License](./LICENSE), so you can adapt it for commercial products, internal tools, or SaaS offerings without friction.

Own your feed. Let your team share updates on your terms.

[^1]: Stevenson, W. J. (2020). *Operations Management* (14th ed.). McGraw-Hill Education.
[^2]: Silver, E. A., Pyke, D. F., & Thomas, D. J. (2017). *Inventory and Production Management in Supply Chains* (4th ed.). CRC Press.
[^3]: Kaplan, R. S., & Norton, D. P. (1996). *The Balanced Scorecard: Translating Strategy into Action*. Harvard Business School Press.
