import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),

  firstname: varchar('first_name', { length: 55 }).notNull(),
  lastname: varchar('last_name', { length: 55 }),

  email: varchar({ length: 255 }).notNull().unique(),

  password: text().notNull(),
  salt: text().notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
});
