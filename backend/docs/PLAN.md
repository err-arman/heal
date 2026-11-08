# PLAN.md

# HEAL Backend Implementation Plan

## 1. Goal

Build the first backend release of HEAL (Health Evidence and Action Link).

The backend will allow research information and files to be submitted, reviewed through a temporary dashboard, approved, published, and viewed through public research APIs.

This release is intended to demonstrate the core concept to the client.

The frontend is outside the scope of this plan.

## 2. First Release Scope

Included:

- Research submission API.
- English and Bangla research metadata.
- Multiple research authors.
- Multiple research domains.
- Primary research report upload.
- Additional research file uploads.
- Temporary review dashboard APIs.
- Review decisions.
- Approval and rejection.
- Research publication.
- Dashboard statistics.
- Public research listing and detail APIs.
- Metadata-based search and filtering.

Not included:

- User registration and login.
- Authentication and role management.
- Organization registration and organization membership.
- Draft submissions.
- Revision requests and resubmission.
- Document-content search.
- AI features.
- Policy tracking and impact dashboards.
- External integrations.
- Frontend applications.

## 3. Users and Roles

The first release does not have application users or user accounts.

The system has three functional access areas:

### Research Submitter

- Accesses the research submission API.
- Provides required research metadata.
- Provides English and Bangla information.
- Adds research authors and domains.
- Uploads one primary research report.
- Can attach additional supporting files.
- Submits the research.

No submitter account is created.

### Temporary Dashboard Operator

- Accesses the temporary review dashboard APIs.
- Views submitted research.
- Views research metadata.
- Opens or downloads research attachments.
- Changes a submission to Under Review.
- Approves or rejects research.
- Publishes approved research.

There is no reviewer account or role system in this release.

### Public Visitor

- Views published research.
- Searches research metadata.
- Filters published research.
- Views research details.
- Accesses attachments belonging to published research.

Public visitors cannot access unpublished research.

## 4. Modules

### Research Module

Responsible for:

- Creating research submissions.
- Retrieving research information.
- Managing research metadata.
- Connecting authors and research domains.
- Returning research details.

### Reference Data Module

Responsible for:

- Research domains.
- Study types.
- Funding source options.
- Location options.

Reference data must be manageable without changing the research workflow.

### Resource Module

Responsible for:

- Uploading research files.
- Recording file metadata.
- Connecting files to research.
- Identifying the primary research report.
- Providing authorized file access.
- Managing public access after publication.

Actual file binaries must be stored in object storage.

### Review Module

Responsible for:

- Recording review decisions.
- Recording review comments.
- Returning review information.
- Preventing duplicate or conflicting review decisions.

### Workflow Module

Responsible for:

- Managing research status transitions.
- Validating allowed transitions.
- Recording status history.
- Preventing publication before approval.

### Dashboard Module

Responsible for:

- Listing all submissions.
- Showing submission details.
- Showing attachment information.
- Returning submission counts by status.
- Providing the data required by the temporary review dashboard.

### Publication Module

Responsible for:

- Publishing approved research.
- Recording publication information.
- Making published research available publicly.
- Preventing unpublished research from appearing in public APIs.

### Public Research Module

Responsible for:

- Listing published research.
- Returning research details.
- Searching research metadata.
- Filtering research.
- Returning public attachment information.

### Database Module

Responsible for:

- Drizzle configuration.
- PostgreSQL connection.
- Database schemas.
- Migration generation and execution.
- Database transactions.

## 5. Architecture Decisions

- **NestJS modular monolith:** Keep the first release in one backend application with separate feature modules.
- **REST API:** Use REST endpoints for submissions, dashboard operations, and public research.
- **PostgreSQL:** Store research information, workflow history, reviews, and file metadata.
- **Drizzle ORM:** Use typed database queries while retaining PostgreSQL SQL capabilities.
- **node-postgres:** Use as the PostgreSQL driver.
- **Bun:** Use as the only package manager and script runner.
- **Node.js 26:** Run the NestJS application on Node.js.
- **Object storage:** Store uploaded file binaries outside PostgreSQL.
- **Database transactions:** Use transactions for submission creation, file metadata association, and workflow changes.
- **Metadata search:** Use PostgreSQL search capabilities for research metadata.
- **Bilingual data:** Store English and Bangla research content.
- **No authentication initially:** Keep the temporary dashboard restricted to an isolated development or demonstration environment.

## 6. Build Phases

Each phase must be implemented, tested, and approved before starting the next phase.

### Phase 1: Backend Foundation

- [ ] Configure strict TypeScript.
- [ ] Configure Node.js 26.
- [ ] Configure Bun scripts.
- [ ] Configure environment variables.
- [ ] Connect PostgreSQL using node-postgres.
- [ ] Configure Drizzle ORM.
- [ ] Create the database module.
- [ ] Configure migration generation and execution.
- [ ] Configure Jest and Supertest.
- [ ] Add a health-check endpoint.
- [ ] Add Swagger documentation.

Completion criteria:

The backend starts successfully on Node.js 26, connects to PostgreSQL, and passes initial tests.

### Phase 2: Reference Data

- [ ] Create research domain management.
- [ ] Add initial research domains from project documentation.
- [ ] Add study type reference data.
- [ ] Add funding source reference data.
- [ ] Add location reference data.
- [ ] Create endpoints to retrieve form options.

Completion criteria:

The submission form can retrieve the reference data required to submit research.

### Phase 3: Research Submission

- [ ] Create the research module.
- [ ] Implement research metadata validation.
- [ ] Implement English and Bangla metadata.
- [ ] Implement author management during submission.
- [ ] Implement multiple research domain assignments.
- [ ] Implement required-field validation.
- [ ] Implement research submission creation.
- [ ] Assign Submitted status automatically.
- [ ] Add submission retrieval endpoints.

Completion criteria:

A complete research submission can be created and retrieved. Incomplete submissions are rejected.

### Phase 4: File Management

- [ ] Configure local file upload.
- [ ] Implement file upload handling.
- [ ] Support PDF files.
- [ ] Support document files.
- [ ] Support spreadsheet files.
- [ ] Support database files.
- [ ] Support images.
- [ ] Support audio files.
- [ ] Support video files.
- [ ] Require exactly one primary research report.
- [ ] Allow optional additional attachments.
- [ ] Store file metadata in PostgreSQL.
- [ ] Connect resources to research submissions.
- [ ] Implement file validation and storage cleanup on failed submissions.

Completion criteria:

A research submission can contain one primary report and multiple additional attachments. File metadata is stored in PostgreSQL and binaries are stored in object storage.

### Phase 5: Temporary Review Dashboard

- [ ] Implement submission listing.
- [ ] Implement submission detail retrieval.
- [ ] Include attachment information.
- [ ] Implement submission counts by status.
- [ ] Implement Under Review transition.
- [ ] Implement review detail retrieval.

Completion criteria:

The temporary dashboard APIs return all submissions, their metadata, attachments, and status counts.

### Phase 6: Review and Publication

- [ ] Implement review decisions.
- [ ] Implement review comments.
- [ ] Implement approval.
- [ ] Implement rejection.
- [ ] Implement publication.
- [ ] Validate allowed status transitions.
- [ ] Record every status change.
- [ ] Prevent publishing rejected or unapproved research.
- [ ] Make published attachments publicly accessible.

Completion criteria:

Approved research can be published. Rejected or unpublished research remains inaccessible through public APIs.

### Phase 7: Public Research Catalogue

- [ ] Implement published research listing.
- [ ] Implement research detail retrieval.
- [ ] Implement metadata search.
- [ ] Implement domain filtering.
- [ ] Implement study type filtering.
- [ ] Implement funding source filtering.
- [ ] Implement location filtering.
- [ ] Implement year filtering.
- [ ] Implement pagination.
- [ ] Return public attachment information.

Completion criteria:

Public visitors can search, filter, view published research, and access its attachments.

### Phase 8: Final Verification

- [ ] Test research submission.
- [ ] Test required-field validation.
- [ ] Test primary report requirements.
- [ ] Test multiple attachments.
- [ ] Test review decisions.
- [ ] Test status transitions.
- [ ] Test publication rules.
- [ ] Test public access restrictions.
- [ ] Test dashboard statistics.
- [ ] Test metadata search.
- [ ] Run the complete Jest test suite.
- [ ] Run lint.
- [ ] Run production build.

Completion criteria:

The complete research submission-to-publication workflow passes integration tests.

## 7. Security and Demonstration Limitations

The first release does not implement authentication or role management.

The temporary dashboard must not be deployed as an unrestricted public administration interface.

Use an isolated development or demonstration environment. Do not store real confidential research or expose administrative operations on a public production deployment until authentication and authorization are implemented.

Public endpoints must only return published research and its attachments.

## 8. What We Are NOT Building Yet

- User accounts.
- Login and registration.
- Organization registration.
- Organization membership.
- Role-based access control.
- Reviewer account management.
- Draft research submissions.
- Revision request workflow.
- Research resubmission.
- Document text extraction.
- Search inside documents.
- AI assistant.
- Vector database.
- Policy tracking.
- Impact measurement.
- Analytics beyond basic dashboard counts.
- External integrations.
- Frontend applications.

## 9. Open Questions

These decisions require client confirmation:

1. Should research revisions create new research versions or update the existing research record?
2. Should multiple reviewers be supported in a later release?
3. Should HEU have additional approval stages?
4. Should research policy tracking be part of a future release?
5. What exact research impact indicators should be measured?
6. What are the final file size and duration limits for each file category?
7. Which object storage provider will be used?
8. Should published research be editable, withdrawn, or replaced?
9. What exact controlled options should be available for study type, funding source, and location?

Do not invent answers to these questions during implementation. Ask before making architecture changes that depend on them.