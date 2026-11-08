# DATABASE.md

# HEAL Database Design

## 1. Purpose

This document describes the first-release PostgreSQL database design for HEAL.

The database supports:

- Research submissions.
- English and Bangla research metadata.
- Research authors.
- Research domains.
- Research file attachments.
- Review decisions.
- Research workflow history.
- Publication.
- Public research search.

The database does not include user accounts, authentication, roles, organization registration, policy tracking, or AI features.

Actual uploaded files are stored in S3-compatible object storage. PostgreSQL stores their metadata and storage references.

## 2. General Database Rules

- Every main record has a unique identifier.
- Related records must have valid relationships.
- Research submissions must contain all required form information.
- English and Bangla research content are required.
- Every submission must have exactly one primary research report.
- Additional research attachments are optional.
- A research submission starts with Submitted status.
- Published research is publicly accessible.
- Unpublished research and its attachments are not publicly accessible.
- Dashboard statistics are calculated from research records.
- Every research status change must be recorded.
- Database transactions must protect multi-step operations.
- Store timestamps for important creation, update, review, and publication events.
- Do not store actual file binaries in PostgreSQL.

## 3. Table: research

Purpose:

Stores the main research submission and its current workflow status.

Phase: Phase 3.

Fields:

- id: Unique identifier. Required.
- submitting_organization_name: Name of the submitting organization entered as text. Required.
- research_year: Year of the research. Required.
- study_type: Selected study type. Required.
- funding_source: Research funding source. Required.
- study_location: Research location. Required.
- status: Current research status. Required. Allowed values:
  - submitted
  - under_review
  - approved
  - rejected
  - published
- submitted_at: Date and time when the submission is completed. Required.
- created_at: Date and time when the record is created. Required.
- updated_at: Date and time when the record is last updated. Required.
- published_at: Date and time when research is published. Optional until publication.

Relationships:

- Has many research translations.
- Has many research authors.
- Has many research domain assignments.
- Has many research resources.
- Has many research reviews.
- Has many research status history records.

Business rules:

- A research record is created only when the complete submission is ready.
- No draft status exists in the first release.
- Every submission must start with Submitted status.
- A research record cannot be published unless it is Approved.
- Rejected research cannot be published.
- Only published research can appear in public research endpoints.
- The submitting organization name is plain text. It does not reference an organization account.

## 4. Table: research_translations

Purpose:

Stores research information in English and Bangla.

Phase: Phase 3.

Fields:

- id: Unique identifier. Required.
- research_id: Related research identifier. Required.
- language: Content language. Required. Allowed values: en, bn.
- title: Research title in the selected language. Required.
- abstract: Research abstract in the selected language. Required.
- description: Research description in the selected language, if included in the approved submission form. Required when this field is part of the form.
- keywords: Research keywords in the selected language. Required.
- created_at: Date and time when the record is created. Required.
- updated_at: Date and time when the record is updated. Required.

Relationships:

- Belongs to one research record.

Business rules:

- Each research record must have one English translation and one Bangla translation.
- A research record cannot have duplicate translations for the same language.
- Both language versions must be complete before submission.
- Search must be able to search the available language content.

## 5. Table: research_authors

Purpose:

Stores the authors associated with a research submission.

Phase: Phase 3.

Fields:

- id: Unique identifier. Required.
- research_id: Related research identifier. Required.
- name: Author's full name. Required.
- affiliation: Author's institution or affiliation. Required if included in the submission form.
- email: Author's contact email. Required if included in the submission form.
- author_order: Position of the author in the research author list. Required.
- created_at: Date and time when the record is created. Required.

Relationships:

- Belongs to one research record.

Business rules:

- A research submission must have at least one author.
- A research record can have multiple authors.
- Author order must be unique within the same research record.
- Authors are stored as research information, not application users.

## 6. Table: research_domains

Purpose:

Stores the available research domain options.

Phase: Phase 2.

Fields:

- id: Unique identifier. Required.
- name_en: Domain name in English. Required.
- name_bn: Domain name in Bangla. Required.
- description_en: English description. Optional.
- description_bn: Bangla description. Optional.
- is_active: Whether the domain is available for new submissions. Required.
- created_at: Date and time when the record is created. Required.
- updated_at: Date and time when the record is updated. Required.

Relationships:

- Has many research domain assignments.

Business rules:

- Domain names should not be duplicated.
- Inactive domains cannot be selected for new submissions.
- Existing research records must retain their domain relationships when a domain becomes inactive.

## 7. Table: research_domain_assignments

Purpose:

Connects research submissions with their selected domains.

Phase: Phase 3.

Fields:

- id: Unique identifier. Required.
- research_id: Related research identifier. Required.
- research_domain_id: Selected domain identifier. Required.
- created_at: Date and time when the relationship is created. Required.

Relationships:

- Belongs to one research record.
- Belongs to one research domain.

Business rules:

- A research submission must have at least one domain.
- A research submission can belong to multiple domains.
- The same domain cannot be assigned twice to the same research record.

## 8. Table: research_resources

Purpose:

Stores metadata and storage references for uploaded research files.

Phase: Phase 4.

Fields:

- id: Unique identifier. Required.
- research_id: Related research identifier. Required.
- original_filename: Original uploaded filename. Required.
- storage_key: Object storage reference. Required.
- file_category: Category of the uploaded file. Required. Allowed values:
  - primary_report
  - document
  - spreadsheet
  - database
  - image
  - audio
  - video
  - other
- mime_type: Uploaded file content type. Required.
- file_size: Uploaded file size. Required.
- checksum: File integrity checksum. Optional.
- is_primary: Whether this file is the primary research report. Required.
- uploaded_at: Date and time when the file is uploaded. Required.
- created_at: Date and time when the record is created. Required.

Relationships:

- Belongs to one research record.

Business rules:

- Every research submission must have exactly one primary research report.
- The primary report must use the primary_report category.
- Additional attachments are optional.
- A research submission can have multiple additional attachments.
- A research submission cannot have two primary reports.
- Actual file binaries must remain in object storage.
- PostgreSQL stores file metadata and storage references only.
- File uploads must be validated before accepting them.
- File metadata must not be exposed for unpublished research through public endpoints.
- Files belonging to published research are publicly accessible in the first release.
- If database submission creation fails after an object upload, orphaned uploaded files must be cleaned up.
- Deleting a research database record must not accidentally leave permanent orphaned objects in storage.

## 9. Table: research_reviews

Purpose:

Stores the temporary dashboard operator's review decision and comments.

Phase: Phase 5 and Phase 6.

Fields:

- id: Unique identifier. Required.
- research_id: Related research identifier. Required.
- decision: Review decision. Required. Allowed values:
  - approved
  - rejected
- comments: Review comments explaining the decision. Required.
- reviewed_at: Date and time when the review is submitted. Required.
- created_at: Date and time when the review record is created. Required.

Relationships:

- Belongs to one research record.

Business rules:

- The first release supports one review decision per research submission.
- No reviewer account or reviewer user identifier is stored.
- A review decision must be associated with a research record.
- An approved decision moves research to Approved status.
- A rejected decision moves research to Rejected status.
- A research record cannot be published without an approved review.
- Review decisions must not silently overwrite existing decisions.

## 10. Table: research_status_history

Purpose:

Stores the history of research status changes.

Phase: Phase 5 and Phase 6.

Fields:

- id: Unique identifier. Required.
- research_id: Related research identifier. Required.
- previous_status: Status before the change. Optional for the initial status.
- new_status: Status after the change. Required.
- changed_at: Date and time when the status changes. Required.
- comment: Reason or explanation for the status change. Optional.

Relationships:

- Belongs to one research record.

Business rules:

- Every status change must create a history record.
- The initial submission creates a history record with Submitted as the new status.
- Status history must not be silently modified or deleted.
- Status changes and history creation must happen in the same database transaction.
- The latest status history entry must agree with the current research status.

## 11. Database Relationships

Main relationships:

- One research record has many translations.
- One research record has many authors.
- One research record has many domain assignments.
- One research domain has many domain assignments.
- One research record has many resources.
- One research record has review information.
- One research record has many status history records.

The research-domain relationship is many-to-many through research_domain_assignments.

The research-resource relationship is one-to-many.

The research-author relationship is one-to-many.

## 12. Research Submission Rules

A research submission must contain:

- Submitting organization name.
- Research year.
- Study type.
- Funding source.
- Study location.
- English research information.
- Bangla research information.
- At least one author.
- At least one research domain.
- Exactly one primary research report.

All fields included in the approved submission form are required in the first release unless explicitly marked optional in this document.

Additional attachments are optional.

A submission must not be accepted as complete until all required metadata and the primary research report are available.

## 13. File Access Rules

Files are stored in S3-compatible object storage.

PostgreSQL stores the file metadata and storage references.

Access rules:

- Files belonging to submitted research are not public.
- Files belonging to research under review are not public.
- Files belonging to approved but unpublished research are not public.
- Files belonging to published research are public.
- All attachments of published research are publicly accessible in the first release.
- Public file access must be checked against the research publication status.

## 14. Research Status Values and Workflow

Allowed research statuses:

- submitted
- under_review
- approved
- rejected
- published

Main workflow:

Submitted -> Under Review -> Approved -> Published

Alternative workflow:

Submitted -> Under Review -> Rejected

Rules:

- Research starts as Submitted.
- Dashboard operator can move Submitted research to Under Review.
- Research under review can be Approved or Rejected.
- Approved research can be Published.
- Rejected research cannot be Published.
- Published research is visible through public research endpoints.
- No Draft or Revision Requested status exists in the first release.

## 15. Future Database Extensions

Do not implement these tables in the first release.

They may be introduced in later releases when requirements are confirmed:

### Identity and Organization

- users
- organizations
- organization_members
- roles
- permissions
- user_roles

### Research Versioning

- research_versions
- research_version_authors
- research_version_domains
- research_version_resources

### Advanced Review

- reviewer_assignments
- review_rounds
- review_score_criteria
- review_scores

### Policy Tracking

- policies
- research_policy_links
- research_policy_events
- impact_stories

### Document Processing

- resource_processing_runs
- resource_text_segments

### AI

- ai_sources
- ai_ingestion_jobs
- ai_chunks
- ai_embedding_models
- ai_embeddings
- ai_conversations
- ai_messages
- ai_message_citations

These extensions require separate requirements and approval before implementation.