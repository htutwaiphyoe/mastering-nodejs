import {
  date,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["admin", "user", "publisher"]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
  dob: date(),
  password: varchar({ length: 255 }).notNull(),
  profileUrl: varchar({ length: 500 }),
  role: userRoleEnum().notNull().default("user"),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deactivatedAt: timestamp(),
  passwordResetTokenHash: varchar({ length: 64 }),
  passwordResetExpiresAt: timestamp(),
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

export const updateUserSchema = createInsertSchema(usersTable, {
  name: () =>
    z
      .string("Name is required")
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters"),
  dob: () => z.iso.date("DOB must be a valid date (YYYY-MM-DD)").optional(),
  profileUrl: () => z.url("Profile URL must be a valid URL").optional(),
})
  .pick({
    name: true,
    dob: true,
    profileUrl: true,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update.",
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum(userRoleEnum.enumValues),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

export const loginSchema = z.object({
  email: z.email("Email must be a valid email"),
  password: z.string("Password is required").min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Email must be a valid email"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string("Token is required").min(1, "Token is required"),
  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const publicUserColumns = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  dob: usersTable.dob,
  profileUrl: usersTable.profileUrl,
  role: usersTable.role,
  createdAt: usersTable.createdAt,
  updatedAt: usersTable.updatedAt,
};

export type AuthUser = Pick<typeof usersTable.$inferSelect, "id" | "role">;

export type PublicUser = Pick<
  typeof usersTable.$inferSelect,
  | "id"
  | "name"
  | "email"
  | "dob"
  | "profileUrl"
  | "role"
  | "createdAt"
  | "updatedAt"
>;
