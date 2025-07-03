const { Buffer } = require("node:buffer");

const buffer = Buffer.alloc(4);

console.log(buffer[0]);

const helloBuffer = Buffer.from("Hello, ");
const nameBuffer = Buffer.from("Htut Wai Phyo");

console.log(nameBuffer);
console.log(nameBuffer.toString());
console.log(nameBuffer.toString("utf-8", 0, 4));

const greetingBuffer = Buffer.concat([helloBuffer, nameBuffer]);

console.log(greetingBuffer.toString());
