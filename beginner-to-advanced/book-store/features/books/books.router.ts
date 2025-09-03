import express from "express";
import { validate } from "@/middleware/validate";
import { idParamSchema } from "@/lib/validators";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook,
} from "./books.controller";
import {
  booksQuerySchema,
  insertBookSchema,
  updateBookSchema,
} from "./books.model";

const router = express.Router();

router.get("/", validate("query", booksQuerySchema), getBooks);

router.get("/:id", validate("params", idParamSchema), getBookById);

router.post("/", validate("body", insertBookSchema), createBook);

router.patch(
  "/:id",
  validate("params", idParamSchema),
  validate("body", updateBookSchema),
  updateBook,
);

router.delete("/:id", validate("params", idParamSchema), deleteBook);

export default router;
