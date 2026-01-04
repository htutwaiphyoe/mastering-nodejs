import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { usersTable } from "@/features/users/users.model";
import { booksTable } from "@/features/books/books.model";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "cancelled",
]);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export const ordersTable = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id),
    status: orderStatusEnum().notNull().default("pending"),
    total: numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("orders_user_id_idx").on(table.userId)],
);

export const orderItemsTable = pgTable(
  "order_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderId: uuid()
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    bookId: uuid().references(() => booksTable.id),
    title: varchar({ length: 255 }).notNull(),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    quantity: integer().notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.uuid("BookId must be a valid UUID"),
        quantity: z
          .number("Quantity is required and must be a number")
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusEnum.enumValues),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const ordersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "total", "status"]).default("createdAt"),
  orderBy: z.enum(["asc", "desc"]).default("desc"),
});

export type OrdersQuery = z.infer<typeof ordersQuerySchema>;
