import express from "express";
import { authenticate } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import { idParamSchema } from "@/libs/validators";
import { createOrderSchema } from "./orders.model";
import { createOrder, getOrders, getOrderById } from "./orders.controller";

const router = express.Router();

router.post("/", authenticate, validate("body", createOrderSchema), createOrder);

router.get("/", authenticate, getOrders);

router.get(
  "/:id",
  authenticate,
  validate("params", idParamSchema),
  getOrderById,
);

export default router;
