import type { Request, Response } from "express";
import db from "@/db";
import {
  usersTable,
  publicUserColumns,
  type SignupInput,
} from "@/features/users/user.model";
import { hashPassword } from "@/lib/password";

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
