import { Request, Response } from "express";
import { books } from "./books.model";

export const getBooks = (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    books,
  });
};

export const getBookById = (req: Request, res: Response) => {
  const id = +req.params.id;

  if (isNaN(id)) {
    return res.status(400).json({
      status: "error",
      message: "Id is invalid.",
    });
  }

  const book = books.find((book) => book.id === id);

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

export const createBook = (req: Request, res: Response) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      status: "error",
      message: "data is invalid.",
    });
  }

  const book = { id: books.length + 1, title, author };

  books.push(book);

  res.status(201).json({
    status: "success",
    book,
  });
};

export const deleteBook = (req: Request, res: Response) => {
  const id = +req.params.id;

  const book = books.findIndex((book) => book.id === id);

  books.splice(book, 1);

  res.status(204).json({
    status: "success",
  });
};
