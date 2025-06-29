const EventEmitter = require("node:events");

const eventEmitter = new EventEmitter();

eventEmitter.on("greet", (username: string) => {
  console.log("Hello", username);
});

eventEmitter.once("notification", (username: string) => {
  console.log("Hello", username);
});

eventEmitter.emit("greet", "jim");
eventEmitter.emit("greet", "jim");
eventEmitter.emit("notification", "jim");
eventEmitter.emit("notification", "jim");
