import type { AppModule } from "./types";
import { action } from "@reatom/framework";
import { initUser } from "../user/user.model.ts";
import { setupDayjs } from "../dayjs.ts";
import { initGsap } from "../gsap/index.ts";
import { startRouter } from "../router/index.ts";
import { initAsTMA } from "./tma.ts";
import { isTMA } from "@tma.js/sdk";
import { defineAppLifecycle } from "./app.model.ts";

export const modules: AppModule[] = [
  {
    name: "user",
    priority: 1,
    init: initUser,
  },
  {
    name: "dayjs",
    init: setupDayjs,
    priority: 2
  },
  {
    name: "gsap",
    priority: 2,
    init: initGsap,
  },
  {
    name: "router",
    priority: 3,
    init: startRouter,
  },
  {
    name: "tma",
    priority: 4,
    init: initAsTMA,
    condition: isTMA,
  },
  import.meta.env.DEV && {
    name: "dev",
    priority: 5,
    init: action(async (ctx) => {
      const { $pane: $dev } = await import("../dev/pane.model.ts");
      $dev.start(ctx);
    }),
    critical: false,
  },
  {
    name: "app",
    priority: 6,
    init: defineAppLifecycle,
  }
].filter(Boolean) as AppModule[];
