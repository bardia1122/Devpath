import Link from "next/link";
import { Route } from "lucide-react";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { SignInButton, SignOutButton } from "@/components/auth-buttons";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-indigo-500 text-white">
            <Route className="size-4" />
          </span>
          <span className="text-zinc-100">DevPath</span>
        </Link>

        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Dashboard
              </Link>
              <Link
                href={`/p/${user.username}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                My profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <SignInButton size="sm" />
          )}
        </nav>
      </div>
    </header>
  );
}
