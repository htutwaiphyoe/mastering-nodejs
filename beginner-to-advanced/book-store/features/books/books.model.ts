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
  title: (schema) => schema.min(1).max(255),
  authorId: () => z.uuid(),
  price: () =>
    z
      .number()
      .min(0)
      .transform((n) => n.toFixed(2)),
  publishedDate: () => z.iso.date(),
  stock: () => z.number().int().min(0),
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
