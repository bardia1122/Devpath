# Contributing to DevPath

Thanks for your interest in improving DevPath! This is a small project, so the
process is lightweight.

## Development setup

1. Fork and clone the repo.
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in the values (see the
   [README](./README.md#2-configure-environment)). You need **one** AI provider
   key — Anthropic *or* Grok/Groq.
4. `npm run db:push` to sync the schema to your Postgres instance.
5. `npm run dev`

## Before opening a pull request

Run the same checks CI runs:

```bash
npm run typecheck
npm run lint
npm run build
```

## Guidelines

- Keep changes focused; one logical change per PR.
- Match the existing code style — TypeScript, functional React components,
  Tailwind utility classes, and the dark-mode-first design.
- Never commit secrets. `.env.local` is gitignored; only commit `.env.example`
  with empty/placeholder values.
- New features for Phase 2+ are tracked in the project's private design blueprint.

## Reporting issues

Open a GitHub issue with steps to reproduce, expected vs. actual behavior, and
your environment (OS, Node version).
