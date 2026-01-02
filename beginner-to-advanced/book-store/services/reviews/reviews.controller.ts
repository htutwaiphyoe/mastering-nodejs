import type { Request, Response } from "express";
import type { Uuid } from "@/libs/validators";
import { getCurrentUser } from "@/libs/user";
import {
  reviewsQuerySchema,
  type CreateReviewInput,
  type UpdateReviewInput,
} from "./reviews.dto";
import * as reviewsService from "./reviews.service";

export const createReview = async (
  req: Request<{ bookId: Uuid }, unknown, CreateReviewInput>,
  res: Response,
) => {
  const currentUser = getCurrentUser(req);

  const review = await reviewsService.createReview({
    userId: currentUser.id,
    bookId: req.params.bookId,
    input: req.body,
  });

  res.status(201).json({
    status: "success",
    review,
  });
};

export const getReviews = async (
  req: Request<{ bookId: Uuid }>,
  res: Response,
) => {
  const query = reviewsQuerySchema.parse(req.query);

  const { reviews, total } = await reviewsService.listBookReviews(
    req.params.bookId,
    query,
  );

  res.status(200).json({
    status: "success",
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
    reviews,
  });
};

export const updateReview = async (
  req: Request<{ id: Uuid }, unknown, UpdateReviewInput>,
  res: Response,
) => {
  const currentUser = getCurrentUser(req);

  const review = await reviewsService.updateReview({
    id: req.params.id,
    user: currentUser,
    input: req.body,
  });

  res.status(200).json({
    status: "success",
    review,
  });
};

export const deleteReview = async (
  req: Request<{ id: Uuid }>,
  res: Response,
) => {
  const currentUser = getCurrentUser(req);

  await reviewsService.deleteReview({
    id: req.params.id,
    user: currentUser,
  });

  res.status(200).json({
    status: "success",
  });
};
