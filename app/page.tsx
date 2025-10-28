// Next.js
import Link from "next/link";

// Icons
import { Origami, PackageCheck, ShieldCheck, Truck } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { SignIn } from "@stackframe/stack";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-2 lg:px-12">
        <section className="space-y-8 text-center lg:text-left">
          <p className="font-sans inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-400 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Enterprise-grade security
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="rounded-3xl inline-block bg-sky-400 p-4">
                <Origami className="text-sky-50 size-12" />
              </div>
              <h1 className="font-sans text-5xl font-black tracking-wide text-sky-400 sm:text-5xl">
                stocKit
              </h1>
            </div>
            <h1 className="font-sans text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Inventory Management System
            </h1>
            <p className="font-sans text-base text-muted-foreground sm:text-lg">
              Track your own stock levels, catch low inventory early, and plan
              restocks from one fast dashboard built for lean teams.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 p-4 text-left shadow-sm">
              <PackageCheck className="mb-3 h-8 w-8 text-primary" />
              <p className="font-sans text-2xl font-semibold text-foreground">
                99.9%
              </p>
              <p className="font-sans text-sm text-muted-foreground">
                Stock accuracy
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-4 text-left shadow-sm">
              <Truck className="mb-3 h-8 w-8 text-primary" />
              <p className="font-sans text-2xl font-semibold text-foreground">
                2 min
              </p>
              <p className="font-sans text-sm text-muted-foreground">
                Update intervals
              </p>
            </div>
            <div className="rounded-xl border border-border/70 p-4 text-left shadow-sm">
              <ShieldCheck className="mb-3 h-8 w-8 text-primary" />
              <p className="font-sans text-2xl font-semibold text-foreground">
                24/7
              </p>
              <p className="font-sans text-sm text-muted-foreground">
                Secure access
              </p>
            </div>
          </div>
          <p className="font-sans text-base text-muted-foreground sm:text-sm">
            Open-source simple inventory management system built with Next.js,
            Neon Auth, and Prisma.
            <Button variant="link">
              <Link href="#">View on Github</Link>
            </Button>
          </p>
        </section>
        <SignIn />
      </div>
    </main>
  );
}
