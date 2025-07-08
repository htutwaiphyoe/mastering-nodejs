import http from "node:http";

const port = 8000;

const url = {
  root: "/",
  contact: "/contact-us",
};

const server = http.createServer((req, res) => {
  switch (req.url) {
    case url.root:
      res.writeHead(200, { "content-type": "application/json" });

      return res.end(
        JSON.stringify({
          statue: "success",
          message: "Hello",
        }),
      );

    case url.contact:
      res.writeHead(200, { "content-type": "application/json" });

      return res.end(
        JSON.stringify({
          statue: "success",
          message: "Contact Us",
        }),
      );

    default:
      res.writeHead(404, { "content-type": "application/json" });

      res.end(
        JSON.stringify({
          statue: "fail",
          message: "Page Not Found",
        }),
      );
  }
});

server.listen(port, () => {
  console.log(`Server is up at port: ${port}`);
});
