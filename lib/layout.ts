import type { GraphData, RoadmapNode } from "@/types";

const X_GAP = 300; // horizontal distance between prerequisite levels
const Y_GAP = 130; // vertical distance between sibling nodes
const NODE_W = 220;

/**
 * Assigns positions to roadmap nodes using simple longest-path layering.
 *
 * The AI returns a DAG of prerequisite edges but no coordinates. We place each
 * node in a column equal to its longest prerequisite chain, so dependencies
 * always flow left → right, then stack siblings vertically and center them.
 */
export function layoutGraph(graph: GraphData): GraphData {
  const { nodes, edges } = graph;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Build adjacency + in-degree, ignoring edges that reference unknown nodes.
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const n of nodes) {
    incoming.set(n.id, []);
    outgoing.set(n.id, []);
  }
  for (const e of edges) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue;
    outgoing.get(e.source)!.push(e.target);
    incoming.get(e.target)!.push(e.source);
  }

  // Longest-path layering via memoized DFS (graph is a DAG; guard cycles).
  const level = new Map<string, number>();
  const visiting = new Set<string>();
  function depth(id: string): number {
    if (level.has(id)) return level.get(id)!;
    if (visiting.has(id)) return 0; // cycle fallback
    visiting.add(id);
    const preds = incoming.get(id) ?? [];
    const d = preds.length === 0 ? 0 : Math.max(...preds.map((p) => depth(p) + 1));
    visiting.delete(id);
    level.set(id, d);
    return d;
  }
  for (const n of nodes) depth(n.id);

  // Group by level, then assign positions centered around y = 0.
  const columns = new Map<number, RoadmapNode[]>();
  for (const n of nodes) {
    const l = level.get(n.id) ?? 0;
    if (!columns.has(l)) columns.set(l, []);
    columns.get(l)!.push(n);
  }

  const positioned = nodes.map((n) => ({ ...n }));
  const posById = new Map(positioned.map((n) => [n.id, n]));

  for (const [l, group] of columns) {
    group.sort((a, b) => a.label.localeCompare(b.label));
    const totalHeight = (group.length - 1) * Y_GAP;
    group.forEach((node, i) => {
      const target = posById.get(node.id)!;
      target.position = {
        x: l * X_GAP,
        y: i * Y_GAP - totalHeight / 2,
      };
    });
  }

  return { nodes: positioned, edges };
}

export const NODE_WIDTH = NODE_W;
