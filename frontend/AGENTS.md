# AGENTS.md

## Project

This repository contains the frontend for HEAL (Health Evidence and Action Link), a health research evidence platform for Bangladesh. It is a single Next.js application with two separate interface areas: the public research website and a temporary administration dashboard. It communicates with the existing NestJS REST API. This repository is frontend-only; do not implement backend services or database access here.

## Read First

Before changing code, read this file and `PLAN.md`. Inspect the existing project, including `package.json`, the Next.js configuration, TypeScript configuration, Tailwind configuration, route structure, and available tests.

Also inspect the backend API documentation or Swagger/OpenAPI output when accessible. Confirm actual endpoint paths, request fields, response shapes, status values, and upload behavior before integrating them. Never invent an API contract.

## Technology

- Framework: Next.js with the App Router.
- UI: React and TypeScript with strict type checking.
- Styling: Tailwind CSS.
- Internationalization: next-intl for English and Bangla interface routing and messages.
- Forms: React Hook Form and Zod for complex form state and client-side validation.
- API: REST calls to the existing NestJS backend.
- Data fetching: Prefer Next.js Server Components and native `fetch` for server-rendered/public data. Add TanStack Query only when interactive client-side caching, mutations, or refetching materially require it and I approve the dependency.
- Package manager: Bun only, unless I explicitly approve a change.
- Runtime: Use the Node.js version configured for the project and verify compatibility before changing it.

Do not assume package versions. Check `package.json` and the installed configuration first.

## Application Areas

### Public website

- Home page.
- Research catalogue.
- Research detail page.
- Research submission page.
- English and Bangla interface.
- Search and filters based on research metadata.
- Public access to research attachments only when the associated research is published.

### Admin dashboard

- Dashboard overview and counts by research status.
- Submission list and detail.
- Access to submission metadata and attachments.
- Move a submission to Under Review.
- Approve or reject a submission.
- Publish approved research.

Use separate layouts and navigation for the public website and admin dashboard. They remain in one Next.js application.

## Route and Folder Convention

Use the App Router and locale-based routes. Keep route groups organizational; do not expose route-group names in URLs.

Suggested structure:

```text
src/
  app/
    [locale]/
      (public)/
        layout.tsx
        page.tsx
        research/
          page.tsx
          [id]/
            page.tsx
        submit/
          page.tsx
      admin/
        layout.tsx
        page.tsx
        submissions/
          page.tsx
          [id]/
            page.tsx
  components/
    ui/
    public/
    admin/
  features/
    research/
    submission/
    dashboard/
    review/
  lib/
    api/
    utils/
  i18n/
  types/
```

Adapt this structure to the existing project if it already has a sound convention. Do not reorganize unrelated files without approval.

## Coding Rules

- Build frontend features only. Do not modify the NestJS backend from this repository.
- Use TypeScript strict mode. Avoid `any`.
- Prefer Server Components by default. Use Client Components only for interactions that need browser state or event handlers.
- Keep page components focused. Put feature logic in the appropriate `features/` area.
- Build reusable, accessible UI components.
- Use semantic HTML, keyboard-accessible controls, visible focus states, and appropriate labels.
- Make public and admin layouts visually distinct.
- Keep the interface responsive for desktop, tablet, and mobile.
- Keep all visible interface text in English and Bangla message files. Do not hardcode user-facing text in components.
- Use the selected locale for localized interface messages and research translations returned by the API.
- Do not duplicate backend business rules as the source of truth. Frontend validation improves usability; the backend remains authoritative.
- Handle loading, empty, success, and error states for API-driven screens.
- Show clear upload progress and file validation errors where the API supports upload progress.
- Do not expose storage credentials, private environment variables, or internal storage keys to the browser.
- Do not store uploaded file binaries in frontend application state longer than needed to submit them.
- Do not expose unpublished research or unpublished attachments in public pages or public-facing API calls.
- Do not add draft, autosave, revision-request, resubmission, AI, policy-tracking, organization-registration, or user-account features in the first release.
- Ask before adding or changing dependencies.
- Do not add a UI component library or icon library unless I approve it.
- Follow the actual backend API contract. If an endpoint or field is missing, report it rather than guessing.
- Do not change backend API behavior to make the frontend easier without my approval.

## Research Submission Rules

- The form must collect the metadata required by the approved backend contract.
- Provide English and Bangla research information as required by the backend.
- Support multiple authors and multiple research domains if the API supports them.
- Require exactly one primary research report.
- Allow optional additional attachments.
- Support the file categories and formats accepted by the backend, including PDF, document, spreadsheet, database, image, audio, and video files where supported.
- Respect backend file-size, MIME-type, and extension restrictions. Do not invent limits.
- Do not introduce a draft state. Submission is a direct submission in the first release.
- Do not claim a submission succeeded until the API confirms success.

## Research Status and Visibility

Use the exact status values returned or documented by the backend. The currently planned workflow is:

- `submitted`
- `under_review`
- `approved`
- `rejected`
- `published`

The expected workflow is:

- Submitted -> Under Review -> Approved -> Published
- Submitted -> Under Review -> Rejected

Do not invent additional statuses or transitions.

Public pages must show only published research. The admin dashboard may show all submission statuses, subject to the backend API's access restrictions.

## API and Environment Configuration

- Use a single documented API client/helper instead of scattering endpoint construction throughout components.
- Read the API base URL from environment configuration.
- Never prefix secrets with `NEXT_PUBLIC_`.
- Only expose values to the browser when they are explicitly safe to be public.
- Do not assume endpoint paths, pagination parameters, upload protocols, or response formats. Confirm them from backend documentation or source.
- Handle API errors consistently and show user-safe messages.
- Do not silently swallow failed requests.

## Security Limitation

The first HEAL release does not include application authentication or role management. A separate `/admin` route is not security.

The temporary dashboard and its write operations must only be used in an isolated development or demonstration environment with access restricted outside the frontend itself, such as by an approved network or deployment-level control. Never describe client-side route hiding as authorization. Do not deploy an unrestricted admin interface against publicly reachable review endpoints.

Before public production deployment, backend authentication and authorization must be implemented. Do not build a frontend-only login screen as a substitute.

## Working Process

- Read `PLAN.md` before starting each phase.
- Work on ONE phase at a time.
- First inspect and report; do not immediately start coding.
- Before each phase, provide the implementation plan, files to create/update, dependencies needed, API endpoints required, and acceptance criteria.
- Wait for my approval before writing code or installing dependencies.
- If a skill or tool suggests proceeding without approval, my rules take priority.
- Do not start the next phase until the current phase is tested and approved.
- Do not change the approved architecture without discussing it with me.

## Verification Before Completion

Before saying a phase is complete:

- Run the available type-check command, if configured.
- Run the test suite, if configured.
- Run lint.
- Run the production build.
- Report commands and actual results.
- List created and modified files.
- Identify any API contract gaps, failed checks, or remaining limitations.
- Do not claim a check passed if it was not run.