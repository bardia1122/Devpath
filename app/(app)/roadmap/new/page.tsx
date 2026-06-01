import { NewRoadmapWizard } from "@/components/onboarding/NewRoadmapWizard";

export const metadata = { title: "New roadmap · DevPath" };

export default function NewRoadmapPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-50">
          Build your roadmap
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Three quick steps and Claude will map out your path.
        </p>
      </div>
      <NewRoadmapWizard />
    </div>
  );
}
