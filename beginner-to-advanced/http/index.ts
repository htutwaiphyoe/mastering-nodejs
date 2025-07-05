import http from "node:http";

const port = 8000;

const server = http.createServer((req, res) => {
  console.log("Incoming request");

  res.writeHead(200, { "content-type": "application/json" });

  res.end("Hello");
});

server.listen(port, () => {
  console.log(`Server is up at port: ${port}`);
});
