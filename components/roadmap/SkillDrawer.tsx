"use client";

import {
  BookOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  PlayCircle,
} from "lucide-react";
import {
  Dialog,
  DialogDrawerContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResourceType, SkillNodeData } from "@/types";
import { CATEGORY_STYLES, PRIORITY_STYLES } from "./constants";

const RESOURCE_ICONS: Record<ResourceType, typeof FileText> = {
  docs: FileText,
  course: GraduationCap,
  book: BookOpen,
  video: PlayCircle,
};

export function SkillDrawer({
  skill,
  open,
  onOpenChange,
  onToggleComplete,
  canEdit,
  pending,
}: {
  skill: SkillNodeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleComplete: (skill: SkillNodeData) => void;
  canEdit: boolean;
  pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogDrawerContent>
        {skill && (
          <div className="flex h-full flex-col">
            <div className="border-b border-zinc-800 p-6 pr-12">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    CATEGORY_STYLES[skill.category]?.badge,
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      CATEGORY_STYLES[skill.category]?.dot,
                    )}
                  />
                  {CATEGORY_STYLES[skill.category]?.label}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    PRIORITY_STYLES[skill.priority]?.badge,
                  )}
                >
                  {PRIORITY_STYLES[skill.priority]?.label}
                </span>
                {skill.status === "known" && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    Already known
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-semibold text-zinc-50">
                {skill.label}
              </DialogTitle>
              {skill.description && (
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {skill.description}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Learning resources
              </h3>
              {skill.resources.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No resources suggested for this skill.
                </p>
              ) : (
                <ul className="space-y-2">
                  {skill.resources.map((r, i) => {
                    const Icon = RESOURCE_ICONS[r.type] ?? FileText;
                    return (
                      <li key={`${r.url}-${i}`}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-800/60"
                        >
                          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-zinc-800 text-indigo-300">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-zinc-100">
                              {r.title}
                            </span>
                            <span className="block truncate text-xs text-zinc-500">
                              {r.url}
                            </span>
                          </span>
                          <ExternalLink className="mt-1 size-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-400" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {canEdit && (
              <div className="border-t border-zinc-800 p-6">
                <Button
                  className="w-full"
                  variant={skill.completed ? "secondary" : "default"}
                  disabled={pending}
                  onClick={() => onToggleComplete(skill)}
                >
                  {pending
                    ? "Saving…"
                    : skill.completed
                      ? "Mark as not done"
                      : "Mark as complete"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogDrawerContent>
    </Dialog>
  );
}
