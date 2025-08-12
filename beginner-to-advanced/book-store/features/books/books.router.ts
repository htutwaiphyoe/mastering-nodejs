import express from "express";
import { validate } from "@/middleware/validate";
import { idParamSchema } from "@/lib/validators";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
} from "./books.controller";
import { insertBookSchema } from "./books.model";

const router = express.Router();

router.get("/", getBooks);

router.get("/:id", validate("params", idParamSchema), getBookById);

router.post("/", validate("body", insertBookSchema), createBook);

router.delete("/:id", validate("params", idParamSchema), deleteBook);

export default router;
