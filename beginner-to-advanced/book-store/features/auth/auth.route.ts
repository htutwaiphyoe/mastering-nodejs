import express from "express";
import { validate } from "@/middlewares/validate";
import { signupSchema, loginSchema } from "@/features/users/users.model";
import { signup, login, refresh, logout } from "./auth.controller";

const router = express.Router();

router.post("/signup", validate("body", signupSchema), signup);

router.post("/login", validate("body", loginSchema), login);

router.post("/refresh", refresh);

router.post("/logout", logout);

export default router;
