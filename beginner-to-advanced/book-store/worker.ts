import { Worker } from "bullmq";
import {
  connection,
  EMAIL_QUEUE,
  PASSWORD_RESET_JOB,
  type PasswordResetJob,
} from "@/libs/queue";
import { sendMail } from "@/libs/mailer";
import { buildPasswordResetEmail } from "@/utils/mail";
import { logger } from "@/libs/logger";

const worker = new Worker(
  EMAIL_QUEUE,
  async (job) => {
    if (job.name === PASSWORD_RESET_JOB) {
      const { to, resetUrl } = job.data as PasswordResetJob;
      await sendMail({ to, ...buildPasswordResetEmail(resetUrl) });
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  logger.info(`Email job ${job.id} (${job.name}) completed`);
});

worker.on("failed", (job, err) => {
  logger.error(
    { err, attempts: job?.attemptsMade },
    `Email job ${job?.id} (${job?.name}) failed`,
  );
});

logger.info("Email worker started");
