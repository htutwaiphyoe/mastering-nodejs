import { and, asc, count, desc, eq, isNull, ne, sql } from "drizzle-orm";
import db from "@/db";
import { reviewsTable, type Review } from "./reviews.model";
import { booksTable } from "@/services/books/books.model";
import { usersTable, type AuthUser } from "@/services/users/users.model";
import { ordersTable, orderItemsTable } from "@/services/orders/orders.model";
import type {
  CreateReviewBody,
  UpdateReviewBody,
  ReviewsQuery,
} from "./reviews.dto";
import { assertOwnership } from "@/libs/role";
import { ApiError } from "@/libs/error";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const recomputeBookRating = async (tx: Tx, bookId: string) => {
  const [agg] = await tx
    .select({
      average: sql<string>`coalesce(avg(${reviewsTable.rating}), 0)`,
      total: count(),
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.bookId, bookId));

  await tx
    .update(booksTable)
    .set({
      ratingsAverage: Number(agg.average).toFixed(2),
      ratingsCount: agg.total,
    })
    .where(eq(booksTable.id, bookId));
};

const findActiveBook = async (bookId: string) => {
  const [book] = await db
    .select({ id: booksTable.id })
    .from(booksTable)
    .where(and(eq(booksTable.id, bookId), isNull(booksTable.deletedAt)))
    .limit(1);
  return book;
};

const hasPurchased = async (userId: string, bookId: string) => {
  const [row] = await db
    .select({ id: orderItemsTable.id })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .where(
      and(
        eq(orderItemsTable.bookId, bookId),
        eq(ordersTable.userId, userId),
        ne(ordersTable.status, "cancelled"),
      ),
    )
    .limit(1);
  return Boolean(row);
};

export const createReview = async (params: {
  userId: string;
  bookId: string;
  input: CreateReviewBody;
}): Promise<Review> => {
  const { userId, bookId, input } = params;

  if (!(await findActiveBook(bookId))) {
    throw ApiError.notFound("Book is not found.");
  }

  if (!(await hasPurchased(userId, bookId))) {
    throw ApiError.forbidden("You can only review books you have purchased.");
  }

  return db.transaction(async (tx) => {
    const [review] = await tx
      .insert(reviewsTable)
      .values({ bookId, userId, rating: input.rating, comment: input.comment })
      .returning();
    await recomputeBookRating(tx, bookId);
    return review;
  });
};

export const getBookReviews = async (bookId: string, query: ReviewsQuery) => {
  if (!(await findActiveBook(bookId))) {
    throw ApiError.notFound("Book is not found.");
  }

  const offset = (query.page - 1) * query.limit;
  const sortColumn =
    query.sortBy === "rating" ? reviewsTable.rating : reviewsTable.createdAt;
  const orderBy = (query.orderBy === "asc" ? asc : desc)(sortColumn);

  const [reviews, [{ total }]] = await Promise.all([
    db
      .select({
        id: reviewsTable.id,
        rating: reviewsTable.rating,
        comment: reviewsTable.comment,
        createdAt: reviewsTable.createdAt,
        user: { id: usersTable.id, name: usersTable.name },
      })
      .from(reviewsTable)
      .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
      .where(eq(reviewsTable.bookId, bookId))
      .orderBy(orderBy)
      .limit(query.limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(reviewsTable)
      .where(eq(reviewsTable.bookId, bookId)),
  ]);

  return { reviews, total };
};

const findReviewOrThrow = async (id: string): Promise<Review> => {
  const [review] = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.id, id))
    .limit(1);
  if (!review) {
    throw ApiError.notFound("Review is not found.");
  }
  return review;
};

export const updateReview = async (params: {
  id: string;
  user: AuthUser;
  input: UpdateReviewBody;
}): Promise<Review> => {
  const existing = await findReviewOrThrow(params.id);
  assertOwnership(params.user, existing.userId);

  return db.transaction(async (tx) => {
    const [review] = await tx
      .update(reviewsTable)
      .set(params.input)
      .where(eq(reviewsTable.id, params.id))
      .returning();
    await recomputeBookRating(tx, existing.bookId);
    return review;
  });
};

export const deleteReview = async (params: {
  id: string;
  user: AuthUser;
}): Promise<void> => {
  const existing = await findReviewOrThrow(params.id);
  assertOwnership(params.user, existing.userId);

  await db.transaction(async (tx) => {
    await tx.delete(reviewsTable).where(eq(reviewsTable.id, params.id));
    await recomputeBookRating(tx, existing.bookId);
  });
};
