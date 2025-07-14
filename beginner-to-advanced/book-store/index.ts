import express from "express";
import { books } from "./db";

const app = express();

app.get("/books", (req, res) => {
  res.status(200).json({
    status: "success",
    books,
  });
});

app.get("/books/:id", (req, res) => {
  const id = +req.params.id;

  if (isNaN(id)) {
    return res.status(400).json({
      status: "error",
      message: "Id is invalid.",
    });
  }

  const book = books.find((book) => book.id === id);

  if (!book) {
    return res.status(404).json({
      status: "failed",
      message: "Book is not found.",
    });
  }

  res.status(200).json({
    status: "success",
    book,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listing on port: ${process.env.PORT}`);
});
