import Image from "next/image";
import { auth } from "@/lib/auth";
import { GithubIcon } from "@/components/icons";

export const metadata = { title: "Settings · DevPath" };

export default async function SettingsPage() {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-50">Settings</h1>

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Profile
        </h2>
        <div className="mt-4 flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? user.username}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="size-14 rounded-full bg-zinc-800" />
          )}
          <div>
            <p className="font-medium text-zinc-100">
              {user.name ?? user.username}
            </p>
            <p className="text-sm text-zinc-500">@{user.username}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-400">
          Your public profile lives at{" "}
          <span className="font-mono text-zinc-300">/p/{user.username}</span>.
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Connections
        </h2>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-3 text-zinc-200">
            <GithubIcon className="size-5" />
            GitHub
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            Connected
          </span>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Repo-based skill auto-detection is coming in Phase 2.
        </p>
      </section>
    </div>
  );
}
