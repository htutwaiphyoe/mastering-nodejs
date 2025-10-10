import express from "express";
import { authenticate } from "@/middleware/authenticate";
import { validate } from "@/middleware/validate";
import { idParamSchema } from "@/lib/validators";
import { updateUserSchema } from "./users.model";
import { me, getUserById, updateUser } from "./users.controller";

const router = express.Router();

router.get("/me", authenticate, me);

router.get("/:id", authenticate, validate("params", idParamSchema), getUserById);

router.patch(
  "/:id",
  authenticate,
  validate("params", idParamSchema),
  validate("body", updateUserSchema),
  updateUser,
);

export default router;
