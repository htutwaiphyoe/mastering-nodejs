import express from "express";
import { validate } from "@/middleware/validate";
import { idParamSchema } from "@/lib/validators";
import {
  createAuthor,
  getAllAuthors,
  getAuthorById,
} from "./author.controller";
import { insertAuthorSchema } from "./author.model";

const router = express.Router();

router.get("/", getAllAuthors);

router.get("/:id", validate("params", idParamSchema), getAuthorById);

router.post("/", validate("body", insertAuthorSchema), createAuthor);

export default router;
