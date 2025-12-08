import express from "express";
import { authenticate } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import { createOrderSchema } from "./orders.model";
import { createOrder } from "./orders.controller";

const router = express.Router();

router.post("/", authenticate, validate("body", createOrderSchema), createOrder);

export default router;
