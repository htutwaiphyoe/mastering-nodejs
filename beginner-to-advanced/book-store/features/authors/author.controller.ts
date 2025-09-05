import type { Request, Response } from "express";
import db from "@/db";
import {
  authorsTable,
  type NewAuthor,
  type UpdateAuthor,
} from "./author.model";
import { booksTable } from "@/features/books/books.model";
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

export const createAuthor = async (
  req: Request<{}, unknown, NewAuthor>,
  res: Response,
) => {
  const [author] = await db.insert(authorsTable).values(req.body).returning();

  res.status(201).json({
    status: "success",
    author,
  });
};

export const updateAuthor = async (
  req: Request<{ id: Uuid }, unknown, UpdateAuthor>,
  res: Response,
) => {
  const { id } = req.params;

  const [author] = await db
    .update(authorsTable)
    .set(req.body)
    .where(eq(authorsTable.id, id))
    .returning();

  if (!author) {
    throw ApiError.notFound("Author is not found.");
  }

  res.status(200).json({
    status: "success",
    author,
  });
};

export const getAuthorBooks = async (
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

  const books = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.authorId, id));

  res.status(200).json({
    status: "success",
    books,
  });
};
