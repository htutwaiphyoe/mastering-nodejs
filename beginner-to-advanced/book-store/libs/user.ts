import type { Request } from "express";
import type { AuthUser } from "@/services/users/users.model";
import { ApiError } from "@/libs/error";

export const getCurrentUser = (req: Request): AuthUser => {
  if (!req.user) {
    throw ApiError.unauthenticated();
  }
  return req.user;
};
