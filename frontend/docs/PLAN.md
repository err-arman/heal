# PLAN.md

# HEAL Frontend Implementation Plan

## 1. Goal

Build the first frontend release of HEAL (Health Evidence and Action Link).

The frontend is one Next.js application with two separate interface areas:

1. A public website for research discovery, research details, and research submission.
2. A temporary admin dashboard for viewing submissions, reviewing them, and publishing approved research.

The frontend communicates with the existing NestJS REST API. It does not connect directly to PostgreSQL or object storage.

This plan covers frontend implementation only. Backend changes are outside its scope.

## 2. Architecture

### Main technologies

- Next.js with App Router.
- React.
- TypeScript with strict mode.
- Tailwind CSS.
- next-intl for English and Bangla interface localization.
- React Hook Form and Zod for the research submission form.
- Native `fetch` and Next.js Server Components for initial API data fetching.
- TanStack Query only if approved and justified by client-side caching or mutation requirements.
- Bun as the package manager.

Do not assume specific package versions. Check the existing `package.json` and verify compatibility before adding or upgrading packages.

### One application, two interface areas

The public website and admin dashboard use separate route layouts, navigation, and components but remain in one Next.js project.

Suggested routes:

- `/en` and `/bn` — home pages.
- `/en/research` and `/bn/research` — research catalogue.
- `/en/research/[id]` and `/bn/research/[id]` — research details.
- `/en/submit` and `/bn/submit` — research submission.
- `/en/admin` and `/bn/admin` — temporary dashboard.
- `/en/admin/submissions` and `/bn/admin/submissions` — submission list.
- `/en/admin/submissions/[id]` and `/bn/admin/submissions/[id]` — submission detail and review actions.

The final URL structure must be checked against the chosen next-intl configuration and the existing project.

## 3. User Areas

The first release does not include application accounts or login.

### Public visitor

Can:

- Open the public HEAL website.
- Browse published research.
- Search research metadata.
- Filter and paginate research results.
- Open published research details.
- Access attachments belonging to published research.
- Open the research submission form.

### Research submitter

Can:

- Enter required research metadata.
- Provide English and Bangla research information as required by the API.
- Add multiple authors.
- Select one or more research domains.
- Upload one required primary research report.
- Upload optional supporting attachments.
- Submit the research.

There is no account creation, draft, or resubmission workflow in the first release.

### Temporary dashboard operator

Can:

- View dashboard counts by status.
- View all research submissions.
- Open submission details.
- View or download submission attachments.
- Move submissions to Under Review.
- Approve or reject submissions.
- Publish approved research.

The dashboard is not protected by application authentication in this release. It must be used only in an isolated demonstration environment with deployment- or network-level access restrictions. A separate frontend route does not secure backend endpoints.

## 4. Frontend Modules and Responsibilities

### Public Website

Responsible for:

- Public site layout and navigation.
- Home page.
- Public research catalogue entry point.
- Language selection.
- Links to research submission.

Do not add unapproved informational sections or features.

### Research Catalogue

Responsible for:

- Listing published research.
- Searching metadata such as title, abstract, keywords, authors, and domains, according to backend API support.
- Filtering by supported research fields.
- Pagination.
- Loading, empty, and error states.

Do not search inside uploaded document contents.

### Research Details

Responsible for:

- Displaying published research metadata.
- Displaying English or Bangla content based on the selected locale.
- Displaying authors and domains.
- Listing attachments.
- Allowing public access to attachments only for published research.

### Research Submission

Responsible for:

- Displaying the research submission form.
- Collecting all required metadata.
- Collecting English and Bangla information.
- Collecting authors and research domains.
- Requiring exactly one primary research report.
- Allowing optional additional attachments.
- Showing validation errors and upload progress.
- Submitting data through the existing backend API.
- Showing success or failure based on the API response.

### Admin Dashboard

Responsible for:

- Showing research counts by status.
- Showing submission lists.
- Showing submission detail pages.
- Providing access to submission attachments.
- Showing the available review and publication actions.

### Review and Publication Interface

Responsible for:

- Moving a submitted record to Under Review.
- Recording approval or rejection using the backend API.
- Showing review comments where supported by the API.
- Publishing approved research.
- Showing the current status and API errors.

The UI must follow backend transition rules and must not invent status transitions.

### Shared UI and API Utilities

Responsible for:

- Reusable buttons, inputs, cards, tables, dialogs, status labels, and upload controls.
- Shared API request helpers.
- Typed API request and response models based on the actual backend contract.
- Shared error handling.
- Locale-aware formatting and interface messages.

## 5. Suggested Folder Structure

Adapt this structure to the existing project rather than reorganizing it unnecessarily.

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

## 6. Build Phases

Implement one phase at a time. Each phase must be tested and approved before moving to the next phase.

### Phase 1: Project Inspection and Frontend Foundation

- [ ] Inspect the existing frontend project and package configuration.
- [ ] Confirm the Node.js and Bun setup.
- [ ] Confirm the Next.js App Router setup.
- [ ] Confirm TypeScript strict mode.
- [ ] Configure or verify Tailwind CSS.
- [ ] Configure English and Bangla locale routing with next-intl.
- [ ] Create the initial public and admin layouts.
- [ ] Configure environment-based API URL.
- [ ] Review existing linting, formatting, and testing tools.
- [ ] Identify dependencies that are missing.
- [ ] Confirm the backend API documentation or Swagger/OpenAPI location.

Completion criteria:

The frontend starts successfully, supports English and Bangla routes, has separate public and admin layouts, and has a documented API configuration. No research feature is implemented yet.

### Phase 2: API Integration Foundation

- [ ] Inspect the actual NestJS API contracts.
- [ ] Confirm research listing and detail endpoints.
- [ ] Confirm research submission endpoint and payload.
- [ ] Confirm reference-data endpoints.
- [ ] Confirm dashboard and review endpoints.
- [ ] Confirm file upload and download behavior.
- [ ] Confirm research status values and allowed transitions.
- [ ] Create a shared API request helper.
- [ ] Create TypeScript request and response types from confirmed contracts.
- [ ] Add consistent handling for loading, error, and unsuccessful responses.

Completion criteria:

The frontend can communicate with the backend using confirmed API contracts. No guessed endpoints or payload shapes remain.

### Phase 3: Public Website Shell

- [ ] Create the public website layout.
- [ ] Create responsive public navigation.
- [ ] Add English/Bangla language switching.
- [ ] Create the public home page.
- [ ] Add a clear path to the research catalogue.
- [ ] Add a clear path to research submission.
- [ ] Add localized interface messages.

Completion criteria:

The public website shell works in both languages on desktop and mobile.

### Phase 4: Public Research Catalogue

- [ ] Create the research listing page.
- [ ] Connect it to the published research API.
- [ ] Display research summary cards or rows.
- [ ] Implement metadata search supported by the backend.
- [ ] Implement supported filters, such as domain, study type, funding source, location, and year.
- [ ] Implement pagination using the backend contract.
- [ ] Add loading, empty, and error states.
- [ ] Ensure only published research is displayed.

Completion criteria:

Visitors can browse, search, filter, and paginate published research.

### Phase 5: Public Research Details and Attachments

- [ ] Create the research detail page.
- [ ] Display the selected language's research information.
- [ ] Display authors and domains.
- [ ] Display available research metadata.
- [ ] Display the primary report and supporting attachments.
- [ ] Implement attachment access using the backend's approved download mechanism.
- [ ] Handle missing research and unavailable attachments.
- [ ] Ensure unpublished research cannot be opened through public pages.

Completion criteria:

Visitors can view published research details and access its attachments.

### Phase 6: Research Submission Form

- [ ] Create the submission form page.
- [ ] Load reference options from the backend.
- [ ] Add required research metadata fields based on the approved API contract.
- [ ] Add English and Bangla research information.
- [ ] Add multiple author controls.
- [ ] Add research domain selection.
- [ ] Add exactly one required primary research report.
- [ ] Add optional multiple supporting attachments.
- [ ] Support the file types accepted by the backend.
- [ ] Show file names, sizes, and upload progress where supported.
- [ ] Validate required fields and file restrictions.
- [ ] Submit through the backend API.
- [ ] Show a confirmation only after successful API submission.
- [ ] Handle validation and network errors.

Completion criteria:

A complete research submission can be sent from the frontend and successfully created by the backend. The UI does not introduce a draft workflow.

### Phase 7: Admin Dashboard

- [ ] Create the separate admin layout and navigation.
- [ ] Connect dashboard statistics to the backend.
- [ ] Display counts for Submitted, Under Review, Approved, Rejected, and Published.
- [ ] Create the submission list.
- [ ] Display status and relevant submission metadata.
- [ ] Add supported status filters and pagination.
- [ ] Create a submission detail page.
- [ ] Display metadata, authors, domains, and attachments.
- [ ] Handle loading, empty, and error states.

Completion criteria:

The temporary dashboard operator can view submission statistics and inspect research submissions.

### Phase 8: Review and Publication Interface

- [ ] Add the action to move a submission to Under Review.
- [ ] Add approval action.
- [ ] Add rejection action.
- [ ] Capture review comments where required by the backend.
- [ ] Add publication action for approved research only.
- [ ] Display current status and review information.
- [ ] Handle invalid transitions and API errors.
- [ ] Refresh the displayed record after successful status changes.
- [ ] Ensure the UI does not show actions that are invalid for the current status.

Completion criteria:

The operator can complete the supported review and publication workflow through the dashboard.

### Phase 9: Final Verification

- [ ] Test English and Bangla routes.
- [ ] Test public catalogue search and filters.
- [ ] Test research detail pages.
- [ ] Test public attachment access.
- [ ] Test required submission fields.
- [ ] Test primary report requirement.
- [ ] Test optional supporting attachments.
- [ ] Test submission success and error handling.
- [ ] Test dashboard status counts.
- [ ] Test review and publication actions.
- [ ] Test that public pages do not expose unpublished research.
- [ ] Test responsive layouts.
- [ ] Test keyboard navigation and visible focus states.
- [ ] Run type checking.
- [ ] Run the configured test suite.
- [ ] Run lint.
- [ ] Run production build.

Completion criteria:

The complete frontend workflow works against the backend API, and all available checks have been run with their actual results recorded.

## 7. Design Guidance

- Use a professional, clear, trustworthy visual style suitable for a national health research evidence platform.
- Prioritize readability and research discovery over decorative effects.
- Make the public website suitable for researchers, policymakers, health professionals, and general visitors.
- Make the admin dashboard efficient for reviewing submissions and changing their status.
- Use a consistent spacing, typography, color, and component system.
- Support English and Bangla text without clipping or layout breakage.
- Make tables and forms usable on smaller screens.
- Do not invent a logo, official government branding, or institutional claims. Use supplied assets or ask for approval.

## 8. Security and Release Limitations

The first release has no frontend login or application account system.

The admin dashboard must only be used in an isolated development or demonstration environment. Access must be restricted outside the frontend itself using an approved deployment- or network-level control.

Hiding admin pages, checking a route in the browser, or using a frontend-only password is not backend authorization.

Do not expose unrestricted review or publication APIs to the public internet. Before production deployment, backend authentication and authorization must be added.

Public users must only receive published research and its attachments.

## 9. Not Included in the First Release

- Frontend user registration and login.
- Organization registration.
- Reviewer account management.
- User and role management.
- Draft submissions.
- Autosave.
- Revision requests.
- Resubmission workflow.
- Searching inside PDF, spreadsheet, audio, or video content.
- AI summaries or chat.
- Vector database integration.
- Policy tracking.
- Research impact analytics.
- External system integrations.
- Separate frontend deployment for public and admin applications.

## 10. Open Questions

Confirm these with the backend contract or client before implementing dependent features:

1. What is the backend API base URL in each environment?
2. Is Swagger/OpenAPI available, and where?
3. What are the exact required research metadata fields?
4. Must every text field be entered in both English and Bangla?
5. What is the exact file upload protocol: multipart upload or pre-signed object-storage URLs?
6. What are the backend's allowed file extensions, MIME types, size limits, and video/audio duration limits?
7. What are the exact search and filter parameters supported by the research API?
8. Which research metadata fields are visible to the public?
9. What is the approved public site content, logo, color palette, and typography?
10. What deployment-level restriction will protect the temporary admin dashboard?
11. What confirmation message should appear after a successful research submission?
12. Should the locale default to English or Bangla?

Do not guess answers. Record unresolved questions and ask before implementing features that depend on them.
