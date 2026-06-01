// Shared TypeScript types for DevPath

export type SkillCategory =
  | "frontend"
  | "backend"
  | "devops"
  | "soft-skills"
  | "architecture";

export type SkillStatus = "known" | "to-learn";

export type SkillPriority = "critical" | "recommended" | "optional";

export type ResourceType = "docs" | "course" | "book" | "video";

export interface SkillResource {
  title: string;
  url: string;
  type: ResourceType;
}

/** A single skill in a roadmap (as produced by the AI). */
export interface RoadmapNode {
  id: string;
  label: string;
  category: SkillCategory;
  status: SkillStatus;
  priority: SkillPriority;
  description: string;
  resources: SkillResource[];
  /** Optional layout position; computed by the layered layout helper. */
  position?: { x: number; y: number };
}

/** A prerequisite relationship: `source` should be learned before `target`. */
export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
}

/** The full graph persisted in `roadmaps.graph_data`. */
export interface GraphData {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

/** Runtime data attached to a React Flow node. */
export interface SkillNodeData extends RoadmapNode {
  completed: boolean;
  [key: string]: unknown;
}

/** Roadmap row shape returned to the client. */
export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  targetRole: string;
  currentSkills: string[] | null;
  graphData: GraphData | null;
  isPublic: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}
