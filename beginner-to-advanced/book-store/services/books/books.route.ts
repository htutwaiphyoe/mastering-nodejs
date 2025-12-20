import express from "express";
import { validate } from "@/middlewares/validate";
import { authenticate } from "@/middlewares/authenticate";
import { authorize } from "@/middlewares/authorize";
import { idParamSchema } from "@/libs/validators";
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

router.post(
  "/",
  authenticate,
  authorize("admin", "publisher"),
  validate("body", insertBookSchema),
  createBook,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "publisher"),
  validate("params", idParamSchema),
  validate("body", updateBookSchema),
  updateBook,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "publisher"),
  validate("params", idParamSchema),
  deleteBook,
);

export default router;
