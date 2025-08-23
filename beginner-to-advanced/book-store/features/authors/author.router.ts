import express from "express";
import { validate } from "@/middleware/validate";
import { idParamSchema } from "@/lib/validators";
import { getAllAuthors, getAuthorById } from "./author.controller";

const router = express.Router();

router.get("/", getAllAuthors);

router.get("/:id", validate("params", idParamSchema), getAuthorById);

export default router;
