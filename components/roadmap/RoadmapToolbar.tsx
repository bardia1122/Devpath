"use client";

import Link from "next/link";
import { ArrowLeft, Check, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CATEGORY_STYLES } from "./constants";
import type { SkillCategory } from "@/types";

const LEGEND_ORDER: SkillCategory[] = [
  "frontend",
  "backend",
  "devops",
  "architecture",
  "soft-skills",
];

export function RoadmapToolbar({
  title,
  targetRole,
  completedCount,
  totalCount,
  canEdit,
  isPublic,
  shareUrl,
  onToggleShare,
  sharePending,
}: {
  title: string;
  targetRole: string;
  completedCount: number;
  totalCount: number;
  canEdit: boolean;
  isPublic: boolean;
  shareUrl?: string;
  onToggleShare?: () => void;
  sharePending?: boolean;
}) {
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4">
      <div className="pointer-events-auto mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/85 p-4 shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-zinc-500 transition-colors hover:text-zinc-200"
                title="Back to dashboard"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="truncate text-lg font-semibold text-zinc-50">
                {title}
              </h1>
            </div>
            <p className="mt-0.5 truncate text-xs text-zinc-500">
              Target role: {targetRole}
            </p>
          </div>

          {canEdit && onToggleShare && (
            <Button
              variant={isPublic ? "secondary" : "outline"}
              size="sm"
              onClick={onToggleShare}
              disabled={sharePending}
            >
              {isPublic ? <Globe /> : <Lock />}
              {isPublic ? "Public" : "Private"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Progress value={pct} className="flex-1" />
          <span className="shrink-0 text-xs font-medium text-zinc-400">
            {completedCount} / {totalCount} done
            {totalCount > 0 && <span className="text-zinc-600"> · {pct}%</span>}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {LEGEND_ORDER.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 text-[11px] text-zinc-500"
            >
              <span className={cn("size-2 rounded-full", CATEGORY_STYLES[c].dot)} />
              {CATEGORY_STYLES[c].label}
            </span>
          ))}
          {isPublic && shareUrl && (
            <span className="ml-auto flex items-center gap-1 text-[11px] text-emerald-400">
              <Check className="size-3" /> Shareable link active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
