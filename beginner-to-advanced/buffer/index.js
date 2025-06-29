const { Buffer } = require("node:buffer");

const buffer = Buffer.alloc(4);

console.log(buffer[0]);

const nameBuffer = Buffer.from("Hello, Htut");

console.log(nameBuffer);
console.log(nameBuffer.toString());
console.log(nameBuffer.toString("utf-8", 0, 4));
