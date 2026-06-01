import Link from "next/link";
import { GitBranch, MapPinned, Share2, Sparkles, Target } from "lucide-react";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { SignInButton } from "@/components/auth-buttons";
import { SiteHeader } from "@/components/site-header";
import { GithubIcon } from "@/components/icons";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-generated roadmaps",
    body: "Claude turns your skills and target role into a structured, prerequisite-aware learning path.",
  },
  {
    icon: MapPinned,
    title: "Interactive graph",
    body: "Pan, zoom, and click through a visual map of skills — color-coded by category and priority.",
  },
  {
    icon: Target,
    title: "Track your progress",
    body: "Check off skills as you master them and watch your completion bar climb.",
  },
  {
    icon: Share2,
    title: "Shareable profile",
    body: "Flip a roadmap public and share your growth plan at devpath.app/p/your-username.",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 0%, rgba(99,102,241,0.18) 0%, rgba(9,9,11,0) 70%)",
            }}
          />
          <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">
              <GitBranch className="size-3.5 text-indigo-400" />
              Visual career roadmaps for developers
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
              Chart your path from{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                where you are
              </span>{" "}
              to where you&apos;re going.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
              DevPath builds a personalized, interactive learning roadmap from
              your current skills and your dream role — then helps you track
              every step.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              {session?.user ? (
                <>
                  <Link
                    href="/roadmap/new"
                    className={buttonVariants({ size: "lg" })}
                  >
                    <Sparkles />
                    Create a roadmap
                  </Link>
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                  >
                    Go to dashboard
                  </Link>
                </>
              ) : (
                <>
                  <SignInButton size="lg" callbackUrl="/roadmap/new" />
                  <Link
                    href="#features"
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                  >
                    See how it works
                  </Link>
                </>
              )}
            </div>
            {!session?.user && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                <GithubIcon className="size-3.5" />
                Sign in with GitHub — no setup required
              </p>
            )}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-5xl px-4 pb-28">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-700"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-zinc-100">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-xs text-zinc-500">
          <span>DevPath</span>
          <span>Built with Next.js, React Flow & Claude</span>
        </div>
      </footer>
    </div>
  );
}
