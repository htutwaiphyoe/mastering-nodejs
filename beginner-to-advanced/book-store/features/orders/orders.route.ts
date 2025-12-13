import express from "express";
import { authenticate } from "@/middlewares/authenticate";
import { authorize } from "@/middlewares/authorize";
import { validate } from "@/middlewares/validate";
import { idParamSchema } from "@/libs/validators";
import { createOrderSchema, updateOrderStatusSchema } from "./orders.model";
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} from "./orders.controller";

const router = express.Router();

router.post("/", authenticate, validate("body", createOrderSchema), createOrder);

router.get("/", authenticate, getOrders);

router.get(
  "/:id",
  authenticate,
  validate("params", idParamSchema),
  getOrderById,
);

router.patch(
  "/:id/cancel",
  authenticate,
  validate("params", idParamSchema),
  cancelOrder,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validate("params", idParamSchema),
  validate("body", updateOrderStatusSchema),
  updateOrderStatus,
);

export default router;
