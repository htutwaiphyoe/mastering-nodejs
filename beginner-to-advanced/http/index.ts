import http from "node:http";
import { log } from "./logger";

const port = 8000;

const ENDPOINT = {
  root: "/",
  contact: "/contact-us",
};

const server = http.createServer((req, res) => {
  const method = req.method;
  const path = req.url;

  log(`${Date()}: ${method} with ${path}`);

  switch (method) {
    case "GET":
      switch (path) {
        case ENDPOINT.root:
          res.writeHead(200, { "content-type": "application/json" });

          return res.end(
            JSON.stringify({
              statue: "success",
              message: "Hello",
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
      break;

    case "POST":
      switch (path) {
        case ENDPOINT.contact:
          res.writeHead(201, { "content-type": "application/json" });

          return res.end(
            JSON.stringify({
              statue: "success",
              message: "Your contact has been sent.",
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
  }
});

server.listen(port, () => {
  console.log(`Server is up at port: ${port}`);
});
