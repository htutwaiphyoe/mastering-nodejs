import express from "express";
import { authenticate } from "@/middleware/authenticate";
import { validate } from "@/middleware/validate";
import { idParamSchema } from "@/lib/validators";
import { me, getUserById } from "./users.controller";

const router = express.Router();

router.get("/me", authenticate, me);

router.get("/:id", authenticate, validate("params", idParamSchema), getUserById);

export default router;
