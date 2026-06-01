"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { RoadmapGraph } from "./RoadmapGraph";
import { RoadmapToolbar } from "./RoadmapToolbar";
import { SkillDrawer } from "./SkillDrawer";
import type { GraphData, SkillNodeData } from "@/types";

export function RoadmapView({
  roadmapId,
  title,
  targetRole,
  graph,
  initialCompleted,
  initialIsPublic,
  canEdit,
  shareUrl,
}: {
  roadmapId: string;
  title: string;
  targetRole: string;
  graph: GraphData;
  initialCompleted: string[];
  initialIsPublic: boolean;
  canEdit: boolean;
  shareUrl?: string;
}) {
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(initialCompleted),
  );
  const [selected, setSelected] = useState<SkillNodeData | null>(null);
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [pending, startTransition] = useTransition();
  const [sharePending, startShareTransition] = useTransition();

  const handleSelect = useCallback(
    (skill: SkillNodeData) => {
      setSelected({ ...skill, completed: completed.has(skill.id) });
      setOpen(true);
    },
    [completed],
  );

  const toggleComplete = useCallback(
    (skill: SkillNodeData) => {
      const next = !completed.has(skill.id);

      // Optimistic update.
      setCompleted((prev) => {
        const copy = new Set(prev);
        if (next) copy.add(skill.id);
        else copy.delete(skill.id);
        return copy;
      });
      setSelected((s) => (s ? { ...s, completed: next } : s));

      startTransition(async () => {
        try {
          const res = await fetch("/api/progress", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roadmapId,
              skillId: skill.id,
              completed: next,
            }),
          });
          if (!res.ok) throw new Error(await res.text());
        } catch (err) {
          // Roll back on failure.
          console.error("Failed to save progress:", err);
          setCompleted((prev) => {
            const copy = new Set(prev);
            if (next) copy.delete(skill.id);
            else copy.add(skill.id);
            return copy;
          });
          setSelected((s) => (s ? { ...s, completed: !next } : s));
        }
      });
    },
    [completed, roadmapId],
  );

  const toggleShare = useCallback(() => {
    const next = !isPublic;
    setIsPublic(next);
    startShareTransition(async () => {
      try {
        const res = await fetch(`/api/roadmap/${roadmapId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic: next }),
        });
        if (!res.ok) throw new Error(await res.text());
      } catch (err) {
        console.error("Failed to update visibility:", err);
        setIsPublic(!next);
      }
    });
  }, [isPublic, roadmapId]);

  const completedCount = useMemo(
    () => graph.nodes.filter((n) => completed.has(n.id)).length,
    [graph.nodes, completed],
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlowProvider>
        <RoadmapGraph
          graph={graph}
          completed={completed}
          onNodeSelect={handleSelect}
        />
      </ReactFlowProvider>

      <RoadmapToolbar
        title={title}
        targetRole={targetRole}
        completedCount={completedCount}
        totalCount={graph.nodes.length}
        canEdit={canEdit}
        isPublic={isPublic}
        shareUrl={shareUrl}
        onToggleShare={toggleShare}
        sharePending={sharePending}
      />

      <SkillDrawer
        skill={selected}
        open={open}
        onOpenChange={setOpen}
        onToggleComplete={toggleComplete}
        canEdit={canEdit}
        pending={pending}
      />
    </div>
  );
}
