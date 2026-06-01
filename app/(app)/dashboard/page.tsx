import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  getCompletedSkillIds,
  getRoadmapsByUserId,
} from "@/lib/db/queries";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_STYLES } from "@/components/roadmap/constants";
import type { SkillCategory } from "@/types";

export const metadata = { title: "Dashboard · DevPath" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const roadmaps = await getRoadmapsByUserId(userId);

  const withProgress = await Promise.all(
    roadmaps.map(async (r) => {
      const completed = await getCompletedSkillIds(r.id);
      const total = r.graphData?.nodes.length ?? 0;
      return { roadmap: r, completedCount: completed.length, total };
    }),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Your roadmaps</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {roadmaps.length
              ? `${roadmaps.length} roadmap${roadmaps.length === 1 ? "" : "s"}`
              : "You haven't created any roadmaps yet."}
          </p>
        </div>
        <Link href="/roadmap/new" className={buttonVariants()}>
          <Plus />
          New roadmap
        </Link>
      </div>

      {withProgress.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-300">
            <Sparkles className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-zinc-100">
            Create your first roadmap
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-400">
            Tell us your skills and where you want to go, and Claude will build
            a personalized learning path.
          </p>
          <Link
            href="/roadmap/new"
            className={`${buttonVariants()} mt-6`}
          >
            <Sparkles />
            Get started
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {withProgress.map(({ roadmap, completedCount, total }) => {
            const pct = total
              ? Math.round((completedCount / total) * 100)
              : 0;
            const categories = Array.from(
              new Set(
                (roadmap.graphData?.nodes ?? []).map((n) => n.category),
              ),
            ) as SkillCategory[];

            return (
              <Link
                key={roadmap.id}
                href={`/roadmap/${roadmap.id}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-zinc-100 group-hover:text-white">
                    {roadmap.title}
                  </h3>
                  {roadmap.isPublic && (
                    <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      Public
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {roadmap.targetRole}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <Progress value={pct} className="flex-1" />
                  <span className="shrink-0 text-xs text-zinc-400">
                    {completedCount}/{total}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1 text-[10px] text-zinc-500"
                    >
                      <span
                        className={`size-1.5 rounded-full ${CATEGORY_STYLES[c].dot}`}
                      />
                      {CATEGORY_STYLES[c].label}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
