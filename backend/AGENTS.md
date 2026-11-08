# AGENTS.md

## Project

HEAL (Health Evidence and Action Link) is a health research evidence platform for Bangladesh. The first release implements the backend for research submissions, file attachments, a temporary review dashboard, research approval and publication, and a public research catalogue. It does not implement user accounts, authentication, roles, organization registration, or frontend applications.

## Technology Stack

- Runtime: Node.js 26
- Package manager: Bun only
- Language: TypeScript (strict mode)
- Backend: NestJS (check package.json for version)
- API: REST
- Database: PostgreSQL
- ORM: Drizzle ORM (check package.json for version)
- PostgreSQL driver: node-postgres (`pg`)
- Tests: Jest + Supertest
- Validation: class-validator and class-transformer
- File storage: S3-compatible object storage

## Commands

Use Bun only. Do not use npm, yarn, or pnpm.

- Development: `bun run dev`
- Tests: `bun run test`
- Lint: `bun run lint`
- Build: `bun run build`
- Database start: `bun run db:up`
- Generate migrations: `bun run db:generate`
- Run migrations: `bun run db:migrate`

Check package.json before using or changing scripts.

## Folder Structure

src/
- modules/<feature>/
  - <feature>.module.ts
  - <feature>.controller.ts
  - <feature>.service.ts
  - dto/
- database/
  - schema/
- common/
- config/
- main.ts

## Coding Rules

- Keep controllers thin. Put business logic in services.
- Validate request DTOs with class-validator.
- Use database transactions for multi-step database changes.
- Validate ownership and resource access wherever applicable.
- Do not expose unpublished research or its files through public endpoints.
- Store secrets only in environment variables.
- Never edit generated migrations by hand.
- Ask before adding libraries or dependencies.
- Write tests for every feature.
- Run tests, lint, and build before saying a task is done.
- Use strict TypeScript. Avoid `any`.
- Keep database constraints and application validation consistent.
- Do not store uploaded file binaries in PostgreSQL.
- Do not introduce user accounts, roles, or authentication in the first release.

## Working Rules

- Read docs/PLAN.md and docs/DATABASE.md before each phase.
- Build ONE phase at a time.
- Get my approval of the plan before writing code.
- If a skill says to proceed without asking, my rules win.
- Use the available deepseek-stack skills when relevant: ds-mode, ds-plan-loop, ds-verify-loop, ds-tdd, and ds-unstick.
- Work with OpenCode and Codex without changing the approved architecture.
- Do not start the next phase until the current phase is tested and approved.