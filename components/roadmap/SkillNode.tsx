"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillNodeData } from "@/types";
import { CATEGORY_STYLES } from "./constants";

/**
 * Custom React Flow node rendering a single skill.
 * - Color-coded left border + dot by category
 * - Checkmark overlay when completed
 * - Ring glow for critical-priority skills
 */
function SkillNodeComponent({ data, selected }: NodeProps) {
  const skill = data as SkillNodeData;
  const cat = CATEGORY_STYLES[skill.category] ?? CATEGORY_STYLES.backend;
  const isCritical = skill.priority === "critical";
  const isKnown = skill.status === "known";

  return (
    <div
      className={cn(
        "group relative w-[220px] cursor-pointer rounded-xl border bg-zinc-900/95 px-4 py-3 shadow-lg transition-all",
        cat.border,
        "border-l-4",
        selected && "ring-2 ring-indigo-400",
        isCritical && !skill.completed && "ring-1 ring-red-500/40",
        skill.completed && "opacity-70",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-zinc-600 !bg-zinc-700"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 shrink-0 rounded-full", cat.dot)} />
          <span
            className={cn(
              "text-sm font-semibold leading-tight text-zinc-100",
              skill.completed && "line-through decoration-zinc-500",
            )}
          >
            {skill.label}
          </span>
        </div>
        {skill.completed && (
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        {isKnown && (
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
            Known
          </span>
        )}
        {isCritical && (
          <span className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-300">
            Critical
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-zinc-600 !bg-zinc-700"
      />
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);
