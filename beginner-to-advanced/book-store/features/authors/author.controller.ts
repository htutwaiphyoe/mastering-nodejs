import type { Request, Response } from "express";
import db from "@/db";
import { authorsTable } from "./author.model";
import type { Uuid } from "@/lib/validators";
import { ApiError } from "@/lib/api-error";
import { eq } from "drizzle-orm";

export const getAllAuthors = async (req: Request, res: Response) => {
  const authors = await db.select().from(authorsTable);

  res.status(200).json({
    status: "success",
    authors,
  });
};

export const getAuthorById = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const { id } = req.params;

  const [author] = await db
    .select()
    .from(authorsTable)
    .where(eq(authorsTable.id, id))
    .limit(1);

  if (!author) {
    throw ApiError.notFound("Author is not found.");
  }

  res.status(200).json({
    status: "success",
    author,
  });
};
