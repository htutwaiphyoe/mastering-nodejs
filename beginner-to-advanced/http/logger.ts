import fs from "node:fs";

export function log(data: string) {
  fs.appendFileSync("./log.txt", data, "utf-8");
}
