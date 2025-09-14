import express from "express";
import { validate } from "@/middleware/validate";
import { idParamSchema } from "@/lib/validators";
import {
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorBooks,
  getAuthorById,
  updateAuthor,
} from "./author.controller";
import {
  authorsQuerySchema,
  insertAuthorSchema,
  updateAuthorSchema,
} from "./author.model";

const router = express.Router();

router.get("/", validate("query", authorsQuerySchema), getAllAuthors);

router.get("/:id", validate("params", idParamSchema), getAuthorById);

router.get("/:id/books", validate("params", idParamSchema), getAuthorBooks);

router.post("/", validate("body", insertAuthorSchema), createAuthor);

router.patch(
  "/:id",
  validate("params", idParamSchema),
  validate("body", updateAuthorSchema),
  updateAuthor,
);

router.delete("/:id", validate("params", idParamSchema), deleteAuthor);

export default router;
