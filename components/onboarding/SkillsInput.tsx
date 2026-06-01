"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "HTML/CSS",
  "Git",
  "SQL",
];

export function SkillsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const skill = raw.trim();
    if (!skill) return;
    if (value.some((s) => s.toLowerCase() === skill.toLowerCase())) return;
    onChange([...value, skill]);
    setDraft("");
  };

  const remove = (skill: string) =>
    onChange(value.filter((s) => s !== skill));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  };

  const remaining = SUGGESTIONS.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="flex min-h-[3rem] flex-wrap items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/60 p-2">
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/15 px-2 py-1 text-sm text-indigo-200"
          >
            {skill}
            <button
              type="button"
              onClick={() => remove(skill)}
              className="text-indigo-300/70 transition-colors hover:text-white"
              aria-label={`Remove ${skill}`}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length ? "Add another…" : "Type a skill and press Enter"}
          className="h-8 flex-1 border-0 bg-transparent px-1 focus-visible:ring-0"
        />
      </div>

      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-zinc-500">Quick add:</span>
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn(
                "rounded-md border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400",
                "transition-colors hover:border-indigo-500/50 hover:text-indigo-200",
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
