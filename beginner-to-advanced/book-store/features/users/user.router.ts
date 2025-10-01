import express from "express";
import { authenticate } from "@/middleware/authenticate";
import { me } from "./user.controller";

const router = express.Router();

router.get("/me", authenticate, me);

export default router;
