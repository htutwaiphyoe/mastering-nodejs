import { Queue, type ConnectionOptions } from "bullmq";
import { env } from "@/libs/env";

const url = new URL(env.REDIS_URL);

export const connection: ConnectionOptions = {
  host: url.hostname,
  port: Number(url.port) || 6379,
};

export type PasswordResetJob = {
  to: string;
  resetUrl: string;
};

export const EMAIL_QUEUE = "email";

export const PASSWORD_RESET_JOB = "password-reset";

export const emailQueue = new Queue(EMAIL_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 100,
  },
});
