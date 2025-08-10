import express from "express";
import { validateBody } from "@/middleware/validate";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
} from "./books.controller";
import { insertBookSchema } from "./books.model";

const router = express.Router();

router.get("/", getBooks);

router.get("/:id", getBookById);

router.post("/", validateBody(insertBookSchema), createBook);

router.delete("/:id", deleteBook);

export default router;
