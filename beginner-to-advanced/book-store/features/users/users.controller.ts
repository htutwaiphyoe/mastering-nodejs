import type { Request, Response } from "express";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import db from "@/db";
import {
  usersTable,
  publicUserColumns,
  type UpdateUserInput,
  type UpdateUserRoleInput,
} from "./users.model";
import { refreshTokensTable } from "@/features/auth/auth.model";
import type { Uuid } from "@/libs/validators";
import { getCurrentUser } from "@/libs/user";
import { ApiError } from "@/libs/error";

export const me = async (req: Request, res: Response) => {
  const { id } = getCurrentUser(req);

  const [user] = await db
    .select(publicUserColumns)
    .from(usersTable)
    .where(and(eq(usersTable.id, id), isNull(usersTable.deactivatedAt)))
    .limit(1);

  if (!user) {
    throw ApiError.unauthenticated("User is no longer active.");
  }

  res.status(200).json({
    status: "success",
    user,
  });
};

export const getUserById = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const { id } = req.params;

  const [user] = await db
    .select(publicUserColumns)
    .from(usersTable)
    .where(and(eq(usersTable.id, id), isNull(usersTable.deactivatedAt)))
    .limit(1);

  if (!user) {
    throw ApiError.notFound("User is not found.");
  }

  res.status(200).json({
    status: "success",
    user,
  });
};

export const deactivateUser = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const { id } = req.params;
  const currentUser = getCurrentUser(req);

  if (currentUser.id !== id && currentUser.role !== "admin") {
    throw ApiError.forbidden("You can only deactivate your own account.");
  }

  const [target] = await db
    .select({ role: usersTable.role })
    .from(usersTable)
    .where(and(eq(usersTable.id, id), isNull(usersTable.deactivatedAt)))
    .limit(1);

  if (!target) {
    throw ApiError.notFound("Active user is not found.");
  }

  if (target.role === "admin") {
    throw ApiError.forbidden("This account cannot be deactivated.");
  }

  const [user] = await db
    .update(usersTable)
    .set({ deactivatedAt: new Date() })
    .where(and(eq(usersTable.id, id), isNull(usersTable.deactivatedAt)))
    .returning(publicUserColumns);

  await db
    .update(refreshTokensTable)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokensTable.userId, id),
        isNull(refreshTokensTable.revokedAt),
      ),
    );

  res.status(200).json({
    status: "success",
    user,
  });
};

export const reactivateUser = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const { id } = req.params;

  const [user] = await db
    .update(usersTable)
    .set({ deactivatedAt: null })
    .where(and(eq(usersTable.id, id), isNotNull(usersTable.deactivatedAt)))
    .returning(publicUserColumns);

  if (!user) {
    throw ApiError.notFound("Deactivated user is not found.");
  }

  res.status(200).json({
    status: "success",
    user,
  });
};

export const updateUser = async (
  req: Request<{ id: Uuid }, unknown, UpdateUserInput>,
  res: Response,
) => {
  const { id } = req.params;
  const currentUser = getCurrentUser(req);

  if (currentUser.id !== id && currentUser.role !== "admin") {
    throw ApiError.forbidden("You can only update your own profile.");
  }

  const [user] = await db
    .update(usersTable)
    .set(req.body)
    .where(and(eq(usersTable.id, id), isNull(usersTable.deactivatedAt)))
    .returning(publicUserColumns);

  if (!user) {
    throw ApiError.notFound("User is not found.");
  }

  res.status(200).json({
    status: "success",
    user,
  });
};

export const updateUserRole = async (
  req: Request<{ id: Uuid }, unknown, UpdateUserRoleInput>,
  res: Response,
) => {
  const { id } = req.params;
  const { role } = req.body;
  const currentUser = getCurrentUser(req);

  if (currentUser.id === id) {
    throw ApiError.forbidden("You cannot change your own role.");
  }

  const [user] = await db
    .update(usersTable)
    .set({ role })
    .where(and(eq(usersTable.id, id), isNull(usersTable.deactivatedAt)))
    .returning(publicUserColumns);

  if (!user) {
    throw ApiError.notFound("Active user is not found.");
  }

  res.status(200).json({
    status: "success",
    user,
  });
};
