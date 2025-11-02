// Next.js
import Link from "next/link"

// Icons
import { Origami, PackageCheck, Truck, ShieldCheck, Github, type LucideIcon } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { SignIn } from "@stackframe/stack"

const heroHighlights: Array<{ icon: LucideIcon; label: string }> = [
  { icon: PackageCheck, label: "Track stock fast" },
  { icon: Truck, label: "Catch low inventory" },
  { icon: ShieldCheck, label: "Secure & reliable" },
]

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-2 lg:px-12">
        {/* Left side – Hero */}
        <section className="space-y-8 text-center lg:text-left">
          <div className="space-y-12">
            <div className="flex items-center gap-5 justify-center lg:justify-start">
              <div className="rounded-3xl bg-sky-400 p-4">
                <Origami className="text-sky-50 size-12" />
              </div>
              <h1 className="font-sans text-5xl font-black tracking-wide text-sky-400 sm:text-5xl">
                StocKit
              </h1>
            </div>

            <h1 className="font-sans text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Track stock without spreadsheets.
            </h1>

            <p className="font-sans text-base text-muted-foreground sm:text-lg max-w-lg">
              A clean, simple stock system for solo sellers and small shops. Update inventory in
              seconds — without ERP chaos or Excel headaches.
            </p>
          </div>

          {/* Key value points */}
          <ul className="grid gap-4 sm:grid-cols-3 text-left">
            {heroHighlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="rounded-xl border border-border/70 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ease-in-out"
              >
                <Icon className="mb-3 h-8 w-8 text-primary" />
                <p className="font-sans text-sm text-muted-foreground">{label}</p>
              </li>
            ))}
          </ul>

          {/* Open source trust note */}
          <div className="pt-3 text-sm text-muted-foreground font-sans flex flex-col items-center gap-2">
            <span>Open-source and transparent — see how everything works or build on it.</span>
            <Button variant="link" asChild className="p-0 h-auto font-medium text-sm">
              <Link
                href="https://github.com/morsechimwai/stockit-nextjs-prisma-neon"
                target="_blank"
                className="inline-flex items-center gap-1"
              >
                <Github className="size-4" />
                View code on GitHub
              </Link>
            </Button>
          </div>
        </section>

        {/* Right side – Auth */}
        <div className="flex justify-center lg:justify-end">
          <SignIn />
        </div>
      </div>
    </main>
  )
}
