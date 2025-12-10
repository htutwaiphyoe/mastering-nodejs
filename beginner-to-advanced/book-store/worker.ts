import { Worker } from "bullmq";
import cron from "node-cron";
import {
  connection,
  EMAIL_QUEUE,
  PASSWORD_RESET_JOB,
  ORDER_CONFIRMATION_JOB,
  type PasswordResetJob,
  type OrderConfirmationJob,
} from "@/libs/queue";
import { sendMail } from "@/libs/mailer";
import {
  buildPasswordResetEmail,
  buildOrderConfirmationEmail,
} from "@/utils/mail";
import { cleanupExpiredTokens } from "@/jobs/cleanup";
import { env } from "@/libs/env";
import { logger } from "@/libs/logger";

const worker = new Worker(
  EMAIL_QUEUE,
  async (job) => {
    if (job.name === PASSWORD_RESET_JOB) {
      const { to, resetUrl } = job.data as PasswordResetJob;
      await sendMail({ to, ...buildPasswordResetEmail(resetUrl) });
    }

    if (job.name === ORDER_CONFIRMATION_JOB) {
      const { to, ...order } = job.data as OrderConfirmationJob;
      await sendMail({ to, ...buildOrderConfirmationEmail(order) });
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

cron.schedule(env.CLEANUP_CRON, () => {
  cleanupExpiredTokens().catch((err) =>
    logger.error({ err }, "Token cleanup failed"),
  );
});

logger.info(`Token cleanup scheduled (${env.CLEANUP_CRON})`);
