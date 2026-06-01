"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const POPULAR_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack Engineer",
  "DevOps Engineer",
  "Senior Software Engineer",
  "Staff Engineer",
  "Engineering Manager",
  "ML Engineer",
];

export function RoleSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (role: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Staff Frontend Engineer"
      />
      <div className="flex flex-wrap gap-2">
        {POPULAR_ROLES.map((role) => {
          const active = value.trim().toLowerCase() === role.toLowerCase();
          return (
            <button
              key={role}
              type="button"
              onClick={() => onChange(role)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                active
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-200"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
              )}
            >
              {role}
            </button>
          );
        })}
      </div>
    </div>
  );
}
