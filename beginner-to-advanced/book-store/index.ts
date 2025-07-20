import express from "express";
import bookRouter from "./features/books/books.router";

const app = express();

app.use(express.json());

app.use("/books", bookRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is listing on port: ${process.env.PORT}`);
});
