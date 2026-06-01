"use client";

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SkillNode } from "./SkillNode";
import { CATEGORY_STYLES } from "./constants";
import type { GraphData, SkillCategory, SkillNodeData } from "@/types";

const nodeTypes = { skill: SkillNode };

const MINIMAP_COLORS: Record<SkillCategory, string> = {
  frontend: "#38bdf8",
  backend: "#34d399",
  devops: "#fbbf24",
  "soft-skills": "#e879f9",
  architecture: "#a78bfa",
};

export function RoadmapGraph({
  graph,
  completed,
  onNodeSelect,
}: {
  graph: GraphData;
  completed: Set<string>;
  onNodeSelect: (skill: SkillNodeData) => void;
}) {
  const nodes = useMemo<Node[]>(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: "skill",
        position: n.position ?? { x: 0, y: 0 },
        data: { ...n, completed: completed.has(n.id) } as SkillNodeData,
      })),
    [graph.nodes, completed],
  );

  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: false,
        style: { stroke: "#3f3f46", strokeWidth: 1.5 },
      })),
    [graph.edges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeSelect(node.data as SkillNodeData)}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={1.75}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      colorMode="dark"
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#27272a" />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) =>
          MINIMAP_COLORS[(n.data as SkillNodeData).category] ?? "#52525b"
        }
        nodeStrokeWidth={0}
        maskColor="rgba(9, 9, 11, 0.7)"
        className="!bg-zinc-900"
      />
    </ReactFlow>
  );
}

// Re-exported so consumers can reference category legend colors if needed.
export { CATEGORY_STYLES };
