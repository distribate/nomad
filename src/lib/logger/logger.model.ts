import { getLogger } from "@logtape/logtape";

export const rootLogger = import.meta.env.DEV ? getLogger(["app"]) : {
  log: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};
