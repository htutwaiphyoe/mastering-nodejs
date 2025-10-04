import type { NextFunction, Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import db from "@/db";
import { usersTable, publicUserColumns } from "@/features/users/users.model";
import { verifyToken } from "@/lib/jwt";
import { ApiError } from "@/lib/api-error";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw ApiError.unauthenticated("Missing or invalid authorization header.");
  }

  const token = header.slice("Bearer ".length);

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthenticated("Invalid or expired token.");
  }

  const [user] = await db
    .select(publicUserColumns)
    .from(usersTable)
    .where(and(eq(usersTable.id, payload.sub), isNull(usersTable.deactivatedAt)))
    .limit(1);

  if (!user) {
    throw ApiError.unauthenticated("User no longer exists.");
  }

  req.user = user;
  next();
};
