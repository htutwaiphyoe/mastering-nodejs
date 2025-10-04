import express from "express";
import { authenticate } from "@/middleware/authenticate";
import { me } from "./users.controller";

const router = express.Router();

router.get("/me", authenticate, me);

export default router;
