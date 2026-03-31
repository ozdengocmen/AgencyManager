# AGENTS.md

## Project summary
- Insurance Agency Management app (POC level).
- UI bundle is compiled/downloaded from make.com; treat current structure as generated and avoid large refactors.
- Future scope includes agentic flows using Python `pydantic-ai` and a lightweight backend.

## Ground rules
- Do **not** connect to real databases or external data sources yet.
- Keep the app at POC complexity: only two users (manager, salesperson).
- Authentication can be simple hardcoded password checks.
- The agency table should remain the base case (currently ~8 rows) and be treated as “from DB.”
- Update mock data to more realistic names/values, but keep the same shape and row count.
- Refactor code as you go to keep code clean
- Keep file sizes small and put helper functions and components in their own files.

## Frontend
- Stack is Vite + React + TypeScript.
- Tailwind pipeline must be restored before UI modifications.
- Current UI is generated; prefer minimal, targeted edits over sweeping rewrites.
- Ensure Turkish/English language support in UI copy and data labels.
- Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default

## Backend (future)
- Add a minimal backend only as needed; keep it stubbed/mocked.
- Agentic flows should use Python with `pydantic-ai`.
- Use `uv` for Python environment management.

## Quick commands
- `npm i`
- `npm run dev`

## Files to know
- Mock data lives in `src/app/data/mockData.ts`.



