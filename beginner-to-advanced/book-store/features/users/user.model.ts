import { date, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  dob: date(),
  password: varchar({ length: 255 }).notNull(),
  profileUrl: varchar({ length: 500 }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deactivatedAt: timestamp(),
});

export const signupSchema = createInsertSchema(usersTable, {
  name: () =>
    z
      .string("Name is required")
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters"),
  email: () => z.email("Email must be a valid email"),
  password: () =>
    z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters"),
  dob: () => z.iso.date("DOB must be a valid date (YYYY-MM-DD)").optional(),
  profileUrl: () => z.url("Profile URL must be a valid URL").optional(),
}).pick({
  name: true,
  email: true,
  password: true,
  dob: true,
  profileUrl: true,
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.email("Email must be a valid email"),
  password: z.string("Password is required").min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const publicUserColumns = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  dob: usersTable.dob,
  profileUrl: usersTable.profileUrl,
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt,
};
