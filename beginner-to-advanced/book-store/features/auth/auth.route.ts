import express from "express";
import { validate } from "@/middleware/validate";
import { signupSchema, loginSchema } from "@/features/users/users.model";
import { signup, login } from "./auth.controller";

const router = express.Router();

router.post("/signup", validate("body", signupSchema), signup);

router.post("/login", validate("body", loginSchema), login);

export default router;
