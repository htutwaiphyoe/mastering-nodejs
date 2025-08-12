import type { NextFunction, Request, Response } from "express";
import { ApiError } from "@/lib/api-error";

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

  const pgCode =
    (err as { code?: string })?.code ??
    (err as { cause?: { code?: string } })?.cause?.code;

  if (pgCode && PG_ERRORS[pgCode]) {
    const { status, message } = PG_ERRORS[pgCode];

    return res.status(status).json({
      status: "error",
      message,
    });
  }

  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal server error.",
  });
};
