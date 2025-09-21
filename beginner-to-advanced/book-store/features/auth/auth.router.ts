import express from "express";
import { validate } from "@/middleware/validate";
import { signupSchema } from "@/features/users/user.model";
import { signup } from "./auth.controller";

const router = express.Router();

router.post("/signup", validate("body", signupSchema), signup);

export default router;
