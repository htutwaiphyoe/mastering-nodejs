import type { Request, Response } from "express";
import { and, asc, count, desc, eq, gte, isNull, sql } from "drizzle-orm";
import db from "@/db";
import { booksTable } from "@/services/books/books.model";
import { usersTable } from "@/services/users/users.model";
import {
  ordersTable,
  orderItemsTable,
  ordersQuerySchema,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
  type OrderStatus,
} from "./orders.model";
import { getCurrentUser } from "@/libs/user";
import type { Uuid } from "@/libs/validators";
import {
  emailQueue,
  ORDER_CONFIRMATION_JOB,
  ORDER_STATUS_JOB,
  type OrderConfirmationJob,
  type OrderStatusJob,
} from "@/libs/queue";
import { ApiError } from "@/libs/error";

const ORDER_SORT = {
  createdAt: ordersTable.createdAt,
  total: ordersTable.total,
  status: ordersTable.status,
};

export const createOrder = async (
  req: Request<{}, unknown, CreateOrderInput>,
  res: Response,
) => {
  const currentUser = getCurrentUser(req);
  const { items } = req.body;

  const result = await db.transaction(async (tx) => {
    let total = 0;
    const lineItems: {
      bookId: string;
      title: string;
      price: string;
      quantity: number;
    }[] = [];

    for (const { bookId, quantity } of items) {
      const [book] = await tx
        .update(booksTable)
        .set({ stock: sql`${booksTable.stock} - ${quantity}` })
        .where(
          and(
            eq(booksTable.id, bookId),
            isNull(booksTable.deletedAt),
            gte(booksTable.stock, quantity),
          ),
        )
        .returning({ title: booksTable.title, price: booksTable.price });

      if (!book) {
        throw ApiError.badRequest(
          `Book ${bookId} is unavailable or has insufficient stock.`,
        );
      }

      total += Number(book.price) * quantity;
      lineItems.push({
        bookId,
        title: book.title,
        price: book.price,
        quantity,
      });
    }

    const [order] = await tx
      .insert(ordersTable)
      .values({ userId: currentUser.id, total: total.toFixed(2) })
      .returning();

    const orderItems = await tx
      .insert(orderItemsTable)
      .values(lineItems.map((item) => ({ orderId: order.id, ...item })))
      .returning();

    return { order, items: orderItems };
  });

  const [buyer] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, currentUser.id))
    .limit(1);

  if (buyer) {
    emailQueue
      .add(ORDER_CONFIRMATION_JOB, {
        to: buyer.email,
        orderId: result.order.id,
        total: result.order.total,
        items: result.items.map((i) => ({
          title: i.title,
          price: i.price,
          quantity: i.quantity,
        })),
      } satisfies OrderConfirmationJob)
      .catch((err) =>
        req.log.error({ err }, "Failed to enqueue order confirmation email"),
      );
  }

  res.status(201).json({
    status: "success",
    order: { ...result.order, items: result.items },
  });
};

export const getOrders = async (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { page, limit, sortBy, orderBy } = ordersQuerySchema.parse(req.query);
  const offset = (page - 1) * limit;

  const where =
    currentUser.role === "admin"
      ? undefined
      : eq(ordersTable.userId, currentUser.id);

  const $orderBy = (orderBy === "asc" ? asc : desc)(ORDER_SORT[sortBy]);

  const [orders, [{ total }]] = await Promise.all([
    db
      .select()
      .from(ordersTable)
      .where(where)
      .orderBy($orderBy)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(ordersTable).where(where),
  ]);

  res.status(200).json({
    status: "success",
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    orders,
  });
};

export const getOrderById = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const { id } = req.params;
  const currentUser = getCurrentUser(req);

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);

  if (!order) {
    throw ApiError.notFound("Order is not found.");
  }

  if (order.userId !== currentUser.id && currentUser.role !== "admin") {
    throw ApiError.forbidden("You can only view your own orders.");
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, id));

  res.status(200).json({
    status: "success",
    order: { ...order, items },
  });
};

export const cancelOrder = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const { id } = req.params;
  const currentUser = getCurrentUser(req);

  const cancelled = await db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .for("update")
      .limit(1);

    if (!order) {
      throw ApiError.notFound("Order is not found.");
    }

    if (order.userId !== currentUser.id && currentUser.role !== "admin") {
      throw ApiError.forbidden("You can only cancel your own orders.");
    }

    if (order.status !== "pending") {
      throw ApiError.conflict("Only pending orders can be cancelled.");
    }

    const items = await tx
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, id));

    for (const item of items) {
      if (item.bookId) {
        await tx
          .update(booksTable)
          .set({ stock: sql`${booksTable.stock} + ${item.quantity}` })
          .where(eq(booksTable.id, item.bookId));
      }
    }

    const [updated] = await tx
      .update(ordersTable)
      .set({ status: "cancelled" })
      .where(eq(ordersTable.id, id))
      .returning();

    return updated;
  });

  const [buyer] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, cancelled.userId))
    .limit(1);

  if (buyer) {
    emailQueue
      .add(ORDER_STATUS_JOB, {
        to: buyer.email,
        orderId: cancelled.id,
        status: cancelled.status,
      } satisfies OrderStatusJob)
      .catch((err) =>
        req.log.error({ err }, "Failed to enqueue order cancellation email"),
      );
  }

  res.status(200).json({
    status: "success",
    order: cancelled,
  });
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid"],
  paid: ["shipped"],
  shipped: [],
  cancelled: [],
};

export const updateOrderStatus = async (
  req: Request<{ id: Uuid }, unknown, UpdateOrderStatusInput>,
  res: Response,
) => {
  const { id } = req.params;
  const { status } = req.body;

  const [order] = await db
    .select({ status: ordersTable.status })
    .from(ordersTable)
    .where(eq(ordersTable.id, id))
    .limit(1);

  if (!order) {
    throw ApiError.notFound("Order is not found.");
  }

  if (!STATUS_TRANSITIONS[order.status].includes(status)) {
    throw ApiError.badRequest(
      `Cannot change status from ${order.status} to ${status}.`,
    );
  }

  const [updated] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();

  const [buyer] = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, updated.userId))
    .limit(1);

  if (buyer) {
    emailQueue
      .add(ORDER_STATUS_JOB, {
        to: buyer.email,
        orderId: updated.id,
        status: updated.status,
      } satisfies OrderStatusJob)
      .catch((err) =>
        req.log.error({ err }, "Failed to enqueue order status email"),
      );
  }

  res.status(200).json({
    status: "success",
    order: updated,
  });
};
