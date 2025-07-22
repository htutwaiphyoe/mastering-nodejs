import express from "express";
import { Book } from "../../types";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
} from "./books.controller";

const router = express.Router();

router.get("/", getBooks);

router.get("/:id", getBookById);

router.post<{}, unknown, Book>("/", createBook);

router.delete("/:id", deleteBook);

export default router;
