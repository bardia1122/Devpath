# DevPath — Visual Career Roadmap Generator

Developers enter their current skills and a target role, and DevPath generates a
personalized, interactive learning roadmap (powered by Claude) that they can
explore on a React Flow canvas, track progress on, and share publicly.

This repo implements **Phase 1 (MVP)** of the DevPath product blueprint (a
private design doc, not published here).

## Features (Phase 1)

- 🔐 **GitHub OAuth login** (NextAuth / Auth.js v5)
- 🧭 **Onboarding wizard** — current skills + target role
- 🤖 **AI roadmap generation** — Claude returns a prerequisite DAG of 15–25 skills
- 🕸️ **Interactive graph** — pan/zoom/click on a React Flow canvas, color-coded by category
- 📚 **Skill drawer** — description + curated learning resources per skill
- ✅ **Progress tracking** — mark skills complete, persisted to Postgres
- 📊 **Progress bar** — X of Y skills done
- 🌍 **Public profiles** — share a roadmap at `/p/<username>`

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + hand-rolled Radix UI primitives |
| Graph | `@xyflow/react` (React Flow v12) |
| Database | PostgreSQL (Supabase/Neon/local) via Drizzle ORM (`postgres` driver) |
| Auth | NextAuth.js v5 (GitHub provider, JWT sessions) |
| AI | Anthropic (`claude-sonnet-4-6`) **or** any OpenAI-compatible Grok/Groq endpoint |

> Deviations from the blueprint (all intentional): the scaffold pulled Next 16 /
> React 19 / Tailwind v4, so we use `@xyflow/react` instead of the legacy
> `reactflow` package, the `postgres` driver instead of `@neondatabase/serverless`,
> hand-rolled UI primitives instead of the interactive shadcn CLI, and the current
> `claude-sonnet-4-6` model instead of the retired snapshot id.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

- **`AUTH_SECRET`** — generate with `npx auth secret` (a dev value is pre-filled in `.env.local`).
- **GitHub OAuth** — create an app at <https://github.com/settings/developers>
  with callback URL `http://localhost:3000/api/auth/callback/github`, then set
  `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`.
- **Database** — a Postgres connection string in `DATABASE_URL` (and `DIRECT_URL`
  for migrations). Supabase, Neon, or a local Postgres all work.
- **AI provider** — you need **one** of:
  - **`ANTHROPIC_API_KEY`** (Claude) — from <https://console.anthropic.com>, or
  - **`GROK_API_KEY`** for an OpenAI-compatible endpoint:
    - **Groq Cloud** (keys start `gsk_`) — the default. Get one at <https://console.groq.com>.
    - **xAI Grok** (keys start `xai-`) — set `GROK_BASE_URL=https://api.x.ai/v1`
      and `GROK_MODEL=grok-2-latest`.
    - **OpenRouter** (keys start `sk-or-v1-`) — set
      `GROK_BASE_URL=https://openrouter.ai/api/v1` and a `GROK_MODEL` such as
      `meta-llama/llama-3.3-70b-instruct`. Useful where Groq is geo-blocked.

  Selection order is `AI_PROVIDER` (if set) → `ANTHROPIC_API_KEY` → `GROK_API_KEY`.
  Set `AI_PROVIDER=anthropic` or `AI_PROVIDER=grok` to force one when both keys exist.

### 3. Set up the database

The repo ships a `docker-compose.yml` with a ready-to-use Postgres. To start it:

```bash
docker compose up -d   # Postgres on 127.0.0.1:5432 (user/pass/db = devpath)
```

Then create the tables:

```bash
npm run db:migrate   # apply the SQL migration in drizzle/migrations, or:
npm run db:push      # sync the Drizzle schema directly (interactive)
```

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

## Project layout

```
app/
  (auth)/login            Sign-in page
  (app)/dashboard         Your roadmaps (auth-guarded layout + header)
  (app)/roadmap/new       Onboarding wizard
  (app)/settings          Profile + connections
  roadmap/[id]            Full-screen roadmap canvas (public-or-owner)
  p/[username]            Public shareable profile
  api/auth/[...nextauth]  Auth.js handlers
  api/roadmap/generate    POST → generate + persist a roadmap
  api/roadmap/[id]        GET / PATCH / DELETE a roadmap
  api/progress            PATCH → toggle a skill complete
components/
  roadmap/                RoadmapGraph, SkillNode, SkillDrawer, RoadmapToolbar, RoadmapView
  onboarding/             SkillsInput, RoleSelector, NewRoadmapWizard
  ui/                     button, input, badge, progress, dialog (drawer)
lib/
  db/                     Drizzle schema, client, queries
  ai/providers.ts         Provider abstraction (Anthropic / Grok / Groq)
  ai/generateRoadmap.ts   Prompt + parsing + validation
  layout.ts               DAG layered positioning for graph nodes
  auth.ts                 NextAuth config
```

## Useful scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Push schema to the database |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:studio` | Open Drizzle Studio |

## What's next (Phase 2)

GitHub repo sync for automatic skill detection, multiple-roadmap templates,
PNG/PDF export, a community browse page, and weekly email digests.

## Security

- **Secrets** live only in `.env.local` (gitignored). Only `.env.example` (no
  values) is committed.
- **Auth**: every mutating API route requires a valid session; roadmap edits,
  deletes, and progress updates additionally enforce **ownership**. Private
  roadmaps are never returned to non-owners.
- **Input validation**: all request bodies are validated with `zod` (with length
  caps); database access is fully parameterized via Drizzle (no string SQL).
- **Rate limiting** (`lib/rate-limit.ts`): an in-memory fixed-window limiter
  guards every API route so a single client can't crash the app or drain the AI
  quota. Generation is the tightest (**5 / 5 min per user**, plus a per-IP
  backstop); progress and edits are higher. _Note: in-memory state is per
  process — swap in a shared store (e.g. Upstash Redis) for multi-instance
  deployments._
- **Error responses** are generic; full error detail is logged server-side only.
- **Headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  and `Permissions-Policy` are set on every response; `X-Powered-By` is removed.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Run `npm run typecheck`,
`npm run lint`, and `npm run build` before opening a PR.

## License

[MIT](./LICENSE) © Bardia Sabbagh
