import type { Request, Response } from "express";
import { and, asc, count, desc, eq, gte, isNull, sql } from "drizzle-orm";
import db from "@/db";
import { booksTable } from "@/features/books/books.model";
import {
  ordersTable,
  orderItemsTable,
  ordersQuerySchema,
  type CreateOrderInput,
} from "./orders.model";
import { getCurrentUser } from "@/libs/user";
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
      lineItems.push({ bookId, title: book.title, price: book.price, quantity });
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
