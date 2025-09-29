import express from "express";
import { validate } from "@/middleware/validate";
import { authenticate } from "@/middleware/authenticate";
import { signupSchema, loginSchema } from "@/features/users/user.model";
import { signup, login, me } from "./auth.controller";

const router = express.Router();

router.post("/signup", validate("body", signupSchema), signup);

router.post("/login", validate("body", loginSchema), login);

router.get("/me", authenticate, me);

export default router;
