import pino from "pino";
import pretty from "pino-pretty";
import { env } from "@/lib/env";

export const logger =
  env.NODE_ENV === "development"
    ? pino(pretty({ colorize: true, translateTime: "SYS:HH:MM:ss" }))
    : pino();
