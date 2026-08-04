import type { AppModule } from "./types";
import type { Ctx } from "@reatom/framework";
import { isTMA } from "@tma.js/sdk";
import { initUser } from "../user/user.model.ts";
import { setupDayjs } from "../dayjs.ts";
import { $gsap } from "../gsap/index.ts";
import { $router } from "../router/index.ts";
import { initAsTMA } from "./tma.ts";
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
    init: $gsap.init,
  },
  {
    name: "router",
    priority: 3,
    init: $router.start,
  },
  {
    name: "tma",
    priority: 4,
    init: initAsTMA,
    when: () => isTMA(),
  },
  {
    name: "dev",
    priority: 5,
    when: () => import.meta.env.DEV,
    init: async (ctx: Ctx) => {
      const { $pane: $dev } = await import("../dev/pane.model.ts");
      $dev.start(ctx);
    },
    critical: false,
  },
  {
    name: "app",
    priority: 6,
    init: defineAppLifecycle,
  }
]
