import express from "express";
import { authenticate } from "@/middlewares/authenticate";
import { authorize } from "@/middlewares/authorize";
import { validate } from "@/middlewares/validate";
import { idParamSchema } from "@/libs/validators";
import { updateUserSchema, updateUserRoleSchema } from "./users.model";
import {
  me,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  updateUserRole,
} from "./users.controller";

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

router.patch(
  "/:id/deactivate",
  authenticate,
  validate("params", idParamSchema),
  deactivateUser,
);

router.patch(
  "/:id/reactivate",
  authenticate,
  authorize("admin"),
  validate("params", idParamSchema),
  reactivateUser,
);

router.patch(
  "/:id/role",
  authenticate,
  authorize("admin"),
  validate("params", idParamSchema),
  validate("body", updateUserRoleSchema),
  updateUserRole,
);

export default router;
