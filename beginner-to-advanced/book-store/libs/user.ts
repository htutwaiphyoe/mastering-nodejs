import type { Request } from "express";
import type { PublicUser } from "@/features/users/users.model";
import { ApiError } from "@/libs/error";

export const getCurrentUser = (req: Request): PublicUser => {
  if (!req.user) {
    throw ApiError.unauthenticated();
  }
  return req.user;
};
