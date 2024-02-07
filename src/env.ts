import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    MYSQL_ROOT_URI: z.string().url(),
    PORT: z.coerce.number(),
    BASIC_AUTH_USER: z.string(),
    BASIC_AUTH_PASS: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
