CREATE TYPE "public"."content_language" AS ENUM('en', 'bn');--> statement-breakpoint
CREATE TYPE "public"."file_category" AS ENUM('primary_report', 'document', 'spreadsheet', 'database', 'image', 'audio', 'video', 'other');--> statement-breakpoint
CREATE TYPE "public"."research_status" AS ENUM('submitted', 'under_review', 'approved', 'rejected', 'published');--> statement-breakpoint
CREATE TYPE "public"."review_decision" AS ENUM('approved', 'rejected');--> statement-breakpoint
CREATE TABLE "funding_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description_en" text,
	"description_bn" text
);
--> statement-breakpoint
CREATE TABLE "study_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submitting_organization_name" text NOT NULL,
	"research_year" integer NOT NULL,
	"study_type_id" uuid NOT NULL,
	"funding_source_id" uuid NOT NULL,
	"study_location_id" uuid NOT NULL,
	"status" "research_status" DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "research_authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_id" uuid NOT NULL,
	"name" text NOT NULL,
	"affiliation" text,
	"email" text,
	"author_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_domain_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_id" uuid NOT NULL,
	"research_domain_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_id" uuid NOT NULL,
	"language" "content_language" NOT NULL,
	"title" text NOT NULL,
	"abstract" text NOT NULL,
	"description" text NOT NULL,
	"keywords" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_id" uuid NOT NULL,
	"original_filename" text NOT NULL,
	"storage_key" text NOT NULL,
	"file_category" "file_category" NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" bigint NOT NULL,
	"checksum" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_id" uuid NOT NULL,
	"decision" "review_decision" NOT NULL,
	"comments" text NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"research_id" uuid NOT NULL,
	"previous_status" "research_status",
	"new_status" "research_status" NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"comment" text
);
--> statement-breakpoint
ALTER TABLE "research" ADD CONSTRAINT "research_study_type_id_study_types_id_fk" FOREIGN KEY ("study_type_id") REFERENCES "public"."study_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research" ADD CONSTRAINT "research_funding_source_id_funding_sources_id_fk" FOREIGN KEY ("funding_source_id") REFERENCES "public"."funding_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research" ADD CONSTRAINT "research_study_location_id_locations_id_fk" FOREIGN KEY ("study_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_authors" ADD CONSTRAINT "research_authors_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_domain_assignments" ADD CONSTRAINT "research_domain_assignments_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_domain_assignments" ADD CONSTRAINT "research_domain_assignments_research_domain_id_research_domains_id_fk" FOREIGN KEY ("research_domain_id") REFERENCES "public"."research_domains"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_translations" ADD CONSTRAINT "research_translations_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_resources" ADD CONSTRAINT "research_resources_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_reviews" ADD CONSTRAINT "research_reviews_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_status_history" ADD CONSTRAINT "research_status_history_research_id_research_id_fk" FOREIGN KEY ("research_id") REFERENCES "public"."research"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "funding_sources_name_en_unique" ON "funding_sources" USING btree ("name_en");--> statement-breakpoint
CREATE UNIQUE INDEX "funding_sources_name_bn_unique" ON "funding_sources" USING btree ("name_bn");--> statement-breakpoint
CREATE INDEX "funding_sources_is_active_idx" ON "funding_sources" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_name_en_unique" ON "locations" USING btree ("name_en");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_name_bn_unique" ON "locations" USING btree ("name_bn");--> statement-breakpoint
CREATE INDEX "locations_is_active_idx" ON "locations" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "research_domains_name_en_unique" ON "research_domains" USING btree ("name_en");--> statement-breakpoint
CREATE UNIQUE INDEX "research_domains_name_bn_unique" ON "research_domains" USING btree ("name_bn");--> statement-breakpoint
CREATE INDEX "research_domains_is_active_idx" ON "research_domains" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "study_types_name_en_unique" ON "study_types" USING btree ("name_en");--> statement-breakpoint
CREATE UNIQUE INDEX "study_types_name_bn_unique" ON "study_types" USING btree ("name_bn");--> statement-breakpoint
CREATE INDEX "study_types_is_active_idx" ON "study_types" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "research_status_idx" ON "research" USING btree ("status");--> statement-breakpoint
CREATE INDEX "research_published_at_idx" ON "research" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "research_year_idx" ON "research" USING btree ("research_year");--> statement-breakpoint
CREATE INDEX "research_study_type_idx" ON "research" USING btree ("study_type_id");--> statement-breakpoint
CREATE INDEX "research_funding_source_idx" ON "research" USING btree ("funding_source_id");--> statement-breakpoint
CREATE INDEX "research_location_idx" ON "research" USING btree ("study_location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_authors_research_order_unique" ON "research_authors" USING btree ("research_id","author_order");--> statement-breakpoint
CREATE INDEX "research_authors_research_idx" ON "research_authors" USING btree ("research_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_domain_assignments_unique" ON "research_domain_assignments" USING btree ("research_id","research_domain_id");--> statement-breakpoint
CREATE INDEX "research_domain_assignments_domain_idx" ON "research_domain_assignments" USING btree ("research_domain_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_translations_research_language_unique" ON "research_translations" USING btree ("research_id","language");--> statement-breakpoint
CREATE INDEX "research_translations_research_idx" ON "research_translations" USING btree ("research_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_resources_storage_key_unique" ON "research_resources" USING btree ("storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "research_resources_one_primary_unique" ON "research_resources" USING btree ("research_id") WHERE "research_resources"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "research_resources_research_idx" ON "research_resources" USING btree ("research_id");--> statement-breakpoint
CREATE UNIQUE INDEX "research_reviews_research_unique" ON "research_reviews" USING btree ("research_id");--> statement-breakpoint
CREATE INDEX "research_reviews_decision_idx" ON "research_reviews" USING btree ("decision");--> statement-breakpoint
CREATE INDEX "research_status_history_research_idx" ON "research_status_history" USING btree ("research_id");--> statement-breakpoint
CREATE INDEX "research_status_history_changed_at_idx" ON "research_status_history" USING btree ("changed_at");