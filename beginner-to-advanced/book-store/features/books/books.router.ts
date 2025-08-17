import express from "express";
import { validate } from "@/middleware/validate";
import { idParamSchema } from "@/lib/validators";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
} from "./books.controller";
import { booksQuerySchema, insertBookSchema } from "./books.model";

const router = express.Router();

router.get("/", validate("query", booksQuerySchema), getBooks);

router.get("/:id", validate("params", idParamSchema), getBookById);

router.post("/", validate("body", insertBookSchema), createBook);

router.delete("/:id", validate("params", idParamSchema), deleteBook);

export default router;
