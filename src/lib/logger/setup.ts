import { configureSync, getConsoleSink } from "@logtape/logtape";

if (import.meta.env.DEV) {
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
  console.log("log setup")
} else {
  console.log("log skip")
}
