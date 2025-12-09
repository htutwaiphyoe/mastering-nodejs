import express from "express";
import { authenticate } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import { createOrderSchema } from "./orders.model";
import { createOrder, getOrders } from "./orders.controller";

const router = express.Router();

router.post("/", authenticate, validate("body", createOrderSchema), createOrder);

router.get("/", authenticate, getOrders);

export default router;
