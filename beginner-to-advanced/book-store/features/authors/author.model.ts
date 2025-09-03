import { date, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const authorsTable = pgTable("authors", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  phone: varchar({ length: 20 }),
  bio: varchar({ length: 1000 }),
  nationality: varchar({ length: 100 }),
  birthDate: date(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const insertAuthorSchema = createInsertSchema(authorsTable, {
  name: () =>
    z
      .string("Name is required")
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters"),
  email: () => z.email("Email must be a valid email"),
  birthDate: () =>
    z.iso.date("BirthDate must be a valid date (YYYY-MM-DD)").optional(),
}).pick({
  name: true,
  email: true,
  phone: true,
  bio: true,
  nationality: true,
  birthDate: true,
});

export type NewAuthor = z.infer<typeof insertAuthorSchema>;
