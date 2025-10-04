import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@/features/users/users.model";
import { ApiError } from "@/lib/api-error";

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthenticated();
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        "You do not have permission to perform this action.",
      );
    }

    next();
  };
