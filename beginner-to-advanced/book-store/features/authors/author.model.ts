import { date, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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

export type Author = typeof authorsTable.$inferSelect;

export type NewAuthor = typeof authorsTable.$inferInsert;
