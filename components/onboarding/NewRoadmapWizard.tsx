"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkillsInput } from "./SkillsInput";
import { RoleSelector } from "./RoleSelector";
import type { Roadmap } from "@/types";

type Step = 0 | 1 | 2;

export function NewRoadmapWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue =
    step === 0 ? true : step === 1 ? role.trim().length > 0 : true;

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSkills: skills,
          targetRole: role.trim(),
          title: title.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { roadmap?: Roadmap; error?: string };
      if (!res.ok || !data.roadmap) {
        throw new Error(data.error ?? "Generation failed");
      }
      router.push(`/roadmap/${data.roadmap.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-indigo-500" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
        {step === 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-50">
                What can you already do?
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Add the languages, frameworks, and tools you&apos;re comfortable
                with. These get marked as <em>known</em> on your roadmap.
              </p>
            </div>
            <SkillsInput value={skills} onChange={setSkills} />
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-50">
                Where are you headed?
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Pick or type the role you want to grow into.
              </p>
            </div>
            <RoleSelector value={role} onChange={setRole} />
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-zinc-50">
                Name your roadmap
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Optional — we&apos;ll generate one if you leave it blank.
              </p>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${skills[0] ?? "Your skills"} → ${role || "Target role"}`}
            />

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Summary
              </div>
              <p className="text-zinc-300">
                <span className="text-zinc-500">Known skills: </span>
                {skills.length ? skills.join(", ") : "none yet"}
              </p>
              <p className="mt-1 text-zinc-300">
                <span className="text-zinc-500">Target role: </span>
                {role || "—"}
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
          </section>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
            disabled={step === 0 || loading}
          >
            <ArrowLeft />
            Back
          </Button>

          {step < 2 ? (
            <Button
              onClick={() => setStep((s) => Math.min(2, s + 1) as Step)}
              disabled={!canContinue}
            >
              Continue
              <ArrowRight />
            </Button>
          ) : (
            <Button onClick={generate} disabled={loading || !role.trim()}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles />
                  Generate roadmap
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-center text-sm text-zinc-500">
          Claude is mapping out your path — this usually takes 10–20 seconds.
        </p>
      )}
    </div>
  );
}
