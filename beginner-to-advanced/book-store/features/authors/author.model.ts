import { date, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const authorsTable = pgTable("authors", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique(),
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
  name: (schema) => schema.min(1).max(255),
  email: () => z.email().optional(),
  birthDate: () => z.iso.date().optional(),
}).pick({
  name: true,
  email: true,
  phone: true,
  bio: true,
  nationality: true,
  birthDate: true,
});

export type NewAuthor = z.infer<typeof insertAuthorSchema>;
