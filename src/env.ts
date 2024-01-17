import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    MYSQL_ROOT_URI: z.string().url(),
    PORT: z.coerce.number(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
