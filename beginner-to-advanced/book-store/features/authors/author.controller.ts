import type { Request, Response } from "express";
import db from "@/db";
import {
  authorsTable,
  authorsQuerySchema,
  type NewAuthor,
  type UpdateAuthor,
} from "./author.model";
import { booksTable } from "@/features/books/books.model";
import type { Uuid } from "@/lib/validators";
import { ApiError } from "@/lib/api-error";
import { and, asc, count, desc, eq, isNull } from "drizzle-orm";

const SORTABLE = {
  name: authorsTable.name,
  email: authorsTable.email,
  birthDate: authorsTable.birthDate,
  createdAt: authorsTable.createdAt,
};

export const getAllAuthors = async (req: Request, res: Response) => {
  const { page, limit, sortBy, orderBy } = authorsQuerySchema.parse(req.query);
  const offset = (page - 1) * limit;

  const where = isNull(authorsTable.deletedAt);

  const $orderBy = (orderBy === "asc" ? asc : desc)(SORTABLE[sortBy]);

  const [authors, [{ total }]] = await Promise.all([
    db
      .select()
      .from(authorsTable)
      .where(where)
      .orderBy($orderBy)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(authorsTable).where(where),
  ]);

  res.status(200).json({
    status: "success",
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
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
    .where(and(eq(authorsTable.id, id), isNull(authorsTable.deletedAt)))
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
    .where(and(eq(authorsTable.id, id), isNull(authorsTable.deletedAt)))
    .returning();

  if (!author) {
    throw ApiError.notFound("Author is not found.");
  }

  res.status(200).json({
    status: "success",
    author,
  });
};

export const deleteAuthor = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const { id } = req.params;

  const [author] = await db
    .update(authorsTable)
    .set({ deletedAt: new Date() })
    .where(and(eq(authorsTable.id, id), isNull(authorsTable.deletedAt)))
    .returning();

  if (!author) {
    throw ApiError.notFound("Author is not found.");
  }

  res.status(200).json({
    status: "success",
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
    .where(and(eq(authorsTable.id, id), isNull(authorsTable.deletedAt)))
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
