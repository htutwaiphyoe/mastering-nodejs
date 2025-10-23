import express from "express";
import { env } from "@/lib/env";
import bookRouter from "@/features/books/books.route";
import authorRouter from "@/features/authors/authors.route";
import authRouter from "@/features/auth/auth.route";
import userRouter from "@/features/users/users.route";
import { errorHandler, notFoundHandler } from "@/middleware/error-handler";

const app = express();

app.use(express.json());

app.use("/books", bookRouter);

app.use("/authors", authorRouter);

app.use("/auth", authRouter);

app.use("/users", userRouter);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is listening on port: ${env.PORT}`);
});
