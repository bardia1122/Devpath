import type { SkillCategory, SkillPriority } from "@/types";

/** Visual styling per skill category. */
export const CATEGORY_STYLES: Record<
  SkillCategory,
  { label: string; dot: string; border: string; badge: string }
> = {
  frontend: {
    label: "Frontend",
    dot: "bg-sky-400",
    border: "border-sky-500/50",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  backend: {
    label: "Backend",
    dot: "bg-emerald-400",
    border: "border-emerald-500/50",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  devops: {
    label: "DevOps",
    dot: "bg-amber-400",
    border: "border-amber-500/50",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  "soft-skills": {
    label: "Soft skills",
    dot: "bg-fuchsia-400",
    border: "border-fuchsia-500/50",
    badge: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  },
  architecture: {
    label: "Architecture",
    dot: "bg-violet-400",
    border: "border-violet-500/50",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
};

export const PRIORITY_STYLES: Record<
  SkillPriority,
  { label: string; badge: string }
> = {
  critical: {
    label: "Critical",
    badge: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  recommended: {
    label: "Recommended",
    badge: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  },
  optional: {
    label: "Optional",
    badge: "bg-zinc-500/10 text-zinc-400 border-zinc-600/30",
  },
};
