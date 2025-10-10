import type { Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import db from "@/db";
import {
  usersTable,
  publicUserColumns,
  type UpdateUserInput,
} from "./users.model";
import type { Uuid } from "@/lib/validators";
import { getCurrentUser } from "@/lib/current-user";
import { ApiError } from "@/lib/api-error";

export const me = (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    user: getCurrentUser(req),
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
