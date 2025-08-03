import {
  date,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authorsTable } from "@/features/authors/author.model";

export const booksTable = pgTable("books", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 255 }).notNull(),
  authorId: uuid()
    .notNull()
    .references(() => authorsTable.id, { onDelete: "cascade" }),
  isbn: varchar({ length: 20 }).unique(),
  description: varchar({ length: 1000 }),
  price: numeric({ precision: 10, scale: 2 }),
  publishedDate: date(),
  stock: integer().notNull().default(0),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Book = typeof booksTable.$inferSelect;

export type NewBook = typeof booksTable.$inferInsert;
