import express from "express";
import { books } from "./db";

const app = express();

app.get("/books", (req, res) => {
  res.status(200).json({
    status: "success",
    books,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listing on port: ${process.env.PORT}`);
});
