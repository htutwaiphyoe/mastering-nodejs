import type { Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import db from "@/db";
import { usersTable, publicUserColumns } from "./users.model";
import type { Uuid } from "@/lib/validators";
import { ApiError } from "@/lib/api-error";

export const me = (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    user: req.user,
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
