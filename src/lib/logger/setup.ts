import { configureSync, getConsoleSink } from "@logtape/logtape";
import { getReatomCtx } from "../app/ctx";
import { connectLogger, createLogBatched } from "@reatom/framework";

if (import.meta.env.DEV) {
  // default logger
  configureSync({
    sinks: {
      console: getConsoleSink(),
    },
    loggers: [
      {
        category: ["logtape", "meta"],
        lowestLevel: "warning",
        sinks: ["console"]
      },
      {
        category: "app",
        lowestLevel: "info",
        sinks: ["console"],
      },
    ],
  });

  // reatom logger
  connectLogger(getReatomCtx(), {
    showCause: true,
    skipUnnamed: true,
    log: createLogBatched(
      {
        debounce: 1,
        limit: 5000,
        getTimeStamp: () => new Date().toLocaleTimeString(),
        log: console.log,
        shouldGroup: true,
      },
    ),
  });
}
