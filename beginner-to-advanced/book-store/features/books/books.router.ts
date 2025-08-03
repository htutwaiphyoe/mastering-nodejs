import express from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
} from "./books.controller";
import type { NewBook } from "./books.model";

const router = express.Router();

router.get("/", getBooks);

router.get("/:id", getBookById);

router.post("/", createBook);

router.delete("/:id", deleteBook);

export default router;
