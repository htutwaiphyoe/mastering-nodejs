import type { Request, Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import db from "@/db";
import {
  usersTable,
  publicUserColumns,
  type SignupInput,
  type LoginInput,
} from "@/features/users/users.model";
import { hashPassword, verifyPassword } from "@/libs/password";
import { signToken } from "@/libs/jwt";
import { ApiError } from "@/libs/error";

export const signup = async (
  req: Request<{}, unknown, SignupInput>,
  res: Response,
) => {
  const { password, ...rest } = req.body;

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values({ ...rest, password: passwordHash })
    .returning(publicUserColumns);

  res.status(201).json({
    status: "success",
    user,
  });
};

export const login = async (
  req: Request<{}, unknown, LoginInput>,
  res: Response,
) => {
  const { email, password } = req.body;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.email, email), isNull(usersTable.deactivatedAt)))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.password))) {
    throw ApiError.unauthenticated("Invalid email or password.");
  }

  const token = signToken({ sub: user.id });

  const { password: _password, ...safeUser } = user;

  res.status(200).json({
    status: "success",
    token,
    user: safeUser,
  });
};
