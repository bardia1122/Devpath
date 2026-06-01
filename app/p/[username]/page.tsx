import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import {
  getCompletedSkillIds,
  getRoadmapsByUserId,
  getUserByUsername,
} from "@/lib/db/queries";
import { SiteHeader } from "@/components/site-header";
import { Progress } from "@/components/ui/progress";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  return {
    title: user
      ? `${user.name ?? user.username} · DevPath`
      : "Profile · DevPath",
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const all = await getRoadmapsByUserId(user.id);
  const publicRoadmaps = all.filter((r) => r.isPublic);

  const withProgress = await Promise.all(
    publicRoadmaps.map(async (r) => {
      const completed = await getCompletedSkillIds(r.id);
      const total = r.graphData?.nodes.length ?? 0;
      return { roadmap: r, completedCount: completed.length, total };
    }),
  );

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name ?? user.username}
              width={72}
              height={72}
              className="rounded-full border border-zinc-800"
            />
          ) : (
            <div className="size-[72px] rounded-full bg-zinc-800" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">
              {user.name ?? user.username}
            </h1>
            <p className="text-sm text-zinc-500">@{user.username}</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Public roadmaps
          </h2>

          {withProgress.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center text-sm text-zinc-500">
              @{user.username} hasn&apos;t shared any roadmaps yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {withProgress.map(({ roadmap, completedCount, total }) => {
                const pct = total
                  ? Math.round((completedCount / total) * 100)
                  : 0;
                return (
                  <Link
                    key={roadmap.id}
                    href={`/roadmap/${roadmap.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="flex items-center gap-1.5 font-semibold text-zinc-100">
                        {roadmap.title}
                        <ArrowUpRight className="size-4 text-zinc-600 transition-colors group-hover:text-zinc-300" />
                      </h3>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {roadmap.targetRole}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={pct} className="max-w-xs flex-1" />
                        <span className="text-xs text-zinc-400">
                          {completedCount}/{total} done
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
