import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCompletedSkillIds, getRoadmapById } from "@/lib/db/queries";
import { RoadmapView } from "@/components/roadmap/RoadmapView";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const roadmap = await getRoadmapById(id);
  return { title: roadmap ? `${roadmap.title} · DevPath` : "Roadmap · DevPath" };
}

export default async function RoadmapPage({ params }: Params) {
  const { id } = await params;
  const roadmap = await getRoadmapById(id);
  if (!roadmap || !roadmap.graphData) {
    notFound();
  }

  const session = await auth();
  const isOwner = session?.user?.id === roadmap.userId;

  // Private roadmaps are only visible to their owner.
  if (!roadmap.isPublic && !isOwner) {
    notFound();
  }

  const completed = await getCompletedSkillIds(id);

  return (
    <div className="h-[100dvh] w-full">
      <RoadmapView
        roadmapId={roadmap.id}
        title={roadmap.title}
        targetRole={roadmap.targetRole}
        graph={roadmap.graphData}
        initialCompleted={completed}
        initialIsPublic={roadmap.isPublic}
        canEdit={isOwner}
      />
    </div>
  );
}
