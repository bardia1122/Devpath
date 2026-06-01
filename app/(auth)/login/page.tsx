import Link from "next/link";
import { redirect } from "next/navigation";
import { Route } from "lucide-react";
import { auth } from "@/lib/auth";
import { SignInButton } from "@/components/auth-buttons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  if (session?.user) {
    redirect(callbackUrl || "/dashboard");
  }

  return (
    <div className="grid min-h-full place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <Link
          href="/"
          className="mx-auto mb-6 flex w-fit items-center gap-2 font-semibold"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-500 text-white">
            <Route className="size-4" />
          </span>
          <span className="text-zinc-100">DevPath</span>
        </Link>

        <h1 className="text-xl font-semibold text-zinc-50">Welcome back</h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Sign in with GitHub to build and track your career roadmaps.
        </p>

        <div className="mt-6 flex justify-center">
          <SignInButton size="lg" callbackUrl={callbackUrl || "/dashboard"} />
        </div>

        <p className="mt-6 text-xs text-zinc-600">
          We only request your public profile to create your account.
        </p>
      </div>
    </div>
  );
}
