import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { ensureDirectory } from "./utils/fs.js";
import { UPLOADS_DIR } from "./config/constants.js";

const app = createApp();
ensureDirectory(UPLOADS_DIR);

app.listen(env.PORT, () => {
  logger.info(`Backend running at http://localhost:${env.PORT}`);
});
