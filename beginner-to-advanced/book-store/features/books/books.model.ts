import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { authorsTable } from "@/features/authors/author.model";

export const booksTable = pgTable(
  "books",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    authorId: uuid()
      .notNull()
      .references(() => authorsTable.id, { onDelete: "cascade" }),
    isbn: varchar({ length: 20 }).unique(),
    description: varchar({ length: 1000 }),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    publishedDate: date().notNull(),
    stock: integer().notNull().default(0),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("books_title_trgm_idx").using(
      "gin",
      sql`${table.title} gin_trgm_ops`,
    ),
  ],
);

export const insertBookSchema = createInsertSchema(booksTable, {
  title: () =>
    z
      .string("Title is required")
      .min(1, "Title cannot be empty")
      .max(255, "Title must be at most 255 characters"),
  authorId: () => z.uuid("AuthorId must be a valid UUID"),
  price: () =>
    z
      .number("Price is required and must be a number")
      .min(0, "Price cannot be negative")
      .transform((n) => n.toFixed(2)),
  publishedDate: () =>
    z.iso.date("PublishedDate must be a valid date (YYYY-MM-DD)"),
  stock: () =>
    z
      .number("Stock must be a number")
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),
}).pick({
  title: true,
  authorId: true,
  isbn: true,
  description: true,
  price: true,
  publishedDate: true,
  stock: true,
});

export type NewBook = z.infer<typeof insertBookSchema>;

export const booksQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type BooksQuery = z.infer<typeof booksQuerySchema>;
