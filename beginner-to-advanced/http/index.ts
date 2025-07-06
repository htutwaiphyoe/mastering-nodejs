import http from "node:http";

const port = 8000;

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "content-type": "application/json" });

    res.end("Hello");
  }

  if (req.url === "/contact-us") {
    res.writeHead(200, { "content-type": "application/json" });

    res.end("Contact Usdasdf");
  }
});

server.listen(port, () => {
  console.log(`Server is up at port: ${port}`);
});
