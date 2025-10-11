import express from "express";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { authorize } from "@/middleware/authorize";
import { idParamSchema } from "@/lib/validators";
import {
  createAuthor,
  deleteAuthor,
  getAllAuthors,
  getAuthorBooks,
  getAuthorById,
  updateAuthor,
} from "./authors.controller";
import {
  authorsQuerySchema,
  insertAuthorSchema,
  updateAuthorSchema,
} from "./authors.model";

const router = express.Router();

router.get("/", validate("query", authorsQuerySchema), getAllAuthors);

router.get("/:id", validate("params", idParamSchema), getAuthorById);

router.get("/:id/books", validate("params", idParamSchema), getAuthorBooks);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate("body", insertAuthorSchema),
  createAuthor,
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validate("params", idParamSchema),
  validate("body", updateAuthorSchema),
  updateAuthor,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate("params", idParamSchema),
  deleteAuthor,
);

export default router;
