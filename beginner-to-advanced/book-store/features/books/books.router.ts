import express from "express";
import { validateBody, validateParams } from "@/middleware/validate";
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

router.get("/:id", validateParams(idParamSchema), getBookById);

router.post("/", validateBody(insertBookSchema), createBook);

router.delete("/:id", validateParams(idParamSchema), deleteBook);

export default router;
