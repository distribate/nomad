import { configureSync, getConsoleSink } from "@logtape/logtape";

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
