import rateLimit from "express-rate-limit";

const WINDOW_MS = 15 * 60 * 1000;

export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many attempts, please try again later.",
  },
});
