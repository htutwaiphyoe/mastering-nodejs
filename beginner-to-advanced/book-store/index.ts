import "dotenv/config";
import express from "express";
import bookRouter from "@/features/books/books.router";
import authorRouter from "@/features/authors/author.router";
import { errorHandler, notFoundHandler } from "@/middleware/error-handler";

const app = express();

app.use(express.json());

app.use("/books", bookRouter);

app.use("/authors", authorRouter);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is listing on port: ${process.env.PORT}`);
});
