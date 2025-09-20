import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/lib/api-error";
import { getPgConstraint, getPgErrorCode } from "@/lib/db-error";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

const PG_ERRORS: Record<string, { status: number; message: string }> = {
  "23505": { status: 409, message: "Resource already exists." }, // unique_violation
  "23503": { status: 400, message: "Referenced resource does not exist." }, // foreign_key_violation
  "23502": { status: 400, message: "A required field is missing." }, // not_null_violation
  "23514": { status: 400, message: "A field failed a constraint check." }, // check_violation
};

const CONSTRAINT_MESSAGES: Record<string, string> = {
  users_email_key: "Email already registered.",
  authors_email_key: "An author with this email already exists.",
  books_isbn_key: "A book with this ISBN already exists.",
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  const pgCode = getPgErrorCode(err);

  if (pgCode && PG_ERRORS[pgCode]) {
    const { status, message } = PG_ERRORS[pgCode];
    const constraint = getPgConstraint(err);
    const friendlyMessage =
      (constraint && CONSTRAINT_MESSAGES[constraint]) || message;

    return res.status(status).json({
      status: "error",
      message: friendlyMessage,
    });
  }

  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal server error.",
  });
};
