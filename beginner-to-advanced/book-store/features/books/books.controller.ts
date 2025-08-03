import type { Request, Response } from "express";
import db from "@/db";
import { booksTable, type NewBook } from "./books.model";
import { eq } from "drizzle-orm";

export const getBooks = async (req: Request, res: Response) => {
  const books = await db.select().from(booksTable);
  res.status(200).json({
    status: "success",
    books,
  });
};

export const getBookById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  const [book] = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, id))
    .limit(1);

  if (!book) {
    return res.status(404).json({
      status: "failed",
      message: "Book is not found.",
    });
  }

  res.status(200).json({
    status: "success",
    book,
  });
};

export const createBook = async (
  req: Request<{}, unknown, NewBook>,
  res: Response,
) => {
  const { title, authorId } = req.body;

  if (!title || !authorId) {
    return res.status(400).json({
      status: "error",
      message: "data is invalid.",
    });
  }

  const [book] = await db.insert(booksTable).values(req.body).returning();

  res.status(201).json({
    status: "success",
    book,
  });
};

export const deleteBook = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  const [book] = await db
    .delete(booksTable)
    .where(eq(booksTable.id, id))
    .returning();

  if (!book) {
    return res.status(404).json({
      status: "failed",
      message: "Book is not found.",
    });
  }

  res.status(204).json({
    status: "success",
  });
};
