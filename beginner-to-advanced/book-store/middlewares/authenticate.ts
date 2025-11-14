import type { NextFunction, Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import db from "@/db";
import { usersTable, publicUserColumns } from "@/features/users/users.model";
import { verifyAccessToken } from "@/libs/jwt";
import { COOKIES, BEARER_PREFIX } from "@/constants";
import { ApiError } from "@/libs/error";

const extractToken = (req: Request): string | undefined => {
  const header = req.headers.authorization;
  if (header?.startsWith(BEARER_PREFIX)) {
    return header.slice(BEARER_PREFIX.length);
  }
  return req.cookies?.[COOKIES.access.name];
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);

  if (!token) {
    throw ApiError.unauthenticated("Authentication required.");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
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
