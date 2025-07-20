import express from "express";
import { books } from "../../db";
import { Book } from "../../types";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    books,
  });
});

router.get("/:id", (req, res) => {
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
});

router.post<{}, unknown, Book>("/", (req, res) => {
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
});

router.delete("/:id", (req, res) => {
  const id = +req.params.id;

  const book = books.findIndex((book) => book.id === id);

  books.splice(book, 1);

  res.status(204).json({
    status: "success",
  });
});

export default router;
