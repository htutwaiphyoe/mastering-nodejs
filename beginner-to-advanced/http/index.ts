import http from "node:http";

const port = 8000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "content-type": "application/json" });

  if (req.url === "/") {
    return res.end(
      JSON.stringify({
        statue: "success",
        message: "Hello",
      }),
    );
  }

  if (req.url === "/contact-us") {
    return res.end(
      JSON.stringify({
        statue: "success",
        message: "Contact Us",
      }),
    );
  }

  res.end(
    JSON.stringify({
      statue: "fail",
      message: "Page Not Found",
    }),
  );
});

server.listen(port, () => {
  console.log(`Server is up at port: ${port}`);
});
