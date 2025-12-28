import { app } from "@/app";
import { env } from "@/libs/env";
import { logger } from "@/libs/logger";

app.listen(env.PORT, () => {
  logger.info(`Server is listening on port: ${env.PORT}`);
});
