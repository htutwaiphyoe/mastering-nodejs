import express from "express";
import helmet from "helmet";
import cors from "cors";
import { pinoHttp } from "pino-http";
import cookieParser from "cookie-parser";
import { env } from "@/libs/env";
import { logger } from "@/libs/logger";
import { apiLimiter, authLimiter } from "@/middlewares/rate-limit";
import healthRouter from "@/services/health/health.route";
import bookRouter from "@/services/books/books.route";
import authorRouter from "@/services/authors/authors.route";
import authRouter from "@/services/auth/auth.route";
import userRouter from "@/services/users/users.route";
import orderRouter from "@/services/orders/orders.route";
import { errorHandler, notFoundHandler } from "@/middlewares/error-handler";

const app = express();

app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === "/health" },
  }),
);

app.use(helmet());

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

app.use(express.json());

app.use(cookieParser());

app.use("/health", healthRouter);

app.use(apiLimiter);

app.use("/books", bookRouter);

app.use("/authors", authorRouter);

app.use("/auth", authLimiter, authRouter);

app.use("/users", userRouter);

app.use("/orders", orderRouter);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Server is listening on port: ${env.PORT}`);
});
