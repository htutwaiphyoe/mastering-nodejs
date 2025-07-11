import express from "express";

const port = 8000;

const app = express();

app.get("/", function (req, res) {
  res.json({
    statue: "success",
    message: "Hello",
  });
});

app.post("/contact-us", function (req, res) {
  res.json({
    statue: "success",
    message: "Your contact has been sent.",
  });
});

app.use((req, res) => {
  res.status(404).json({
    statue: "fail",
    message: "Page Not Found",
  });
});

app.listen(port, () => {
  console.log("Express is listening");
});
