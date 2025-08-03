CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar(255) NOT NULL,
	"authorId" uuid NOT NULL,
	"isbn" varchar(20) UNIQUE,
	"description" varchar(1000),
	"price" numeric(10,2),
	"publishedDate" date,
	"stock" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_authorId_authors_id_fkey" FOREIGN KEY ("authorId") REFERENCES "authors"("id") ON DELETE CASCADE;