import type { Request, Response } from "express";
import db from "@/db";
import { booksTable, type BooksQuery, type NewBook } from "./books.model";
import { authorsTable } from "@/features/authors/author.model";
import type { Uuid } from "@/lib/validators";
import { ApiError } from "@/lib/api-error";
import { eq, ilike } from "drizzle-orm";

export const getBooks = async (
  req: Request<{}, unknown, unknown, BooksQuery>,
  res: Response,
) => {
  const { search } = req.query;

  const books = await db
    .select()
    .from(booksTable)
    .where(search ? ilike(booksTable.title, `%${search}%`) : undefined);

  res.status(200).json({
    status: "success",
    books,
  });
};

export const getBookById = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const { id } = req.params;

  const [data] = await db
    .select()
    .from(booksTable)
    .leftJoin(authorsTable, eq(booksTable.authorId, authorsTable.id))
    .where(eq(booksTable.id, id))
    .limit(1);

  if (!data) {
    throw ApiError.notFound("Book is not found.");
  }

  res.status(200).json({
    status: "success",
    book: {
      ...data.books,
      author: data.authors,
    },
  });
};

export const createBook = async (
  req: Request<{}, unknown, NewBook>,
  res: Response,
) => {
  const [book] = await db.insert(booksTable).values(req.body).returning();

  res.status(201).json({
    status: "success",
    book,
  });
};

export const deleteBook = async (req: Request<{ id: Uuid }>, res: Response) => {
  const { id } = req.params;

  const [book] = await db
    .delete(booksTable)
    .where(eq(booksTable.id, id))
    .returning();

  if (!book) {
    throw ApiError.notFound("Book is not found.");
  }

  res.status(200).json({
    status: "success",
  });
};
