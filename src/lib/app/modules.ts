import type { AppModule } from "./types";
import type { Ctx } from "@reatom/framework";
import { initUser } from "@/lib/user/user.model.ts";
import { setupDayjs } from "@/lib/dayjs.ts";
import { $gsap } from "@/lib/gsap/index.ts";
import { $router } from "router/index";
import { initAsTMA } from "./tma.ts";
import { $appState, defineAppLifecycle } from "./app.model.ts";
import { getConfigVal } from "@/const/config.ts";
import { STATIC_CONFIG_KEYS } from "../dev/const.ts";

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
    init: async (ctx) => $router.start(ctx, { log: getConfigVal(STATIC_CONFIG_KEYS.LOG_ROUTER) }),
  },
  {
    name: "tma",
    priority: 4,
    init: initAsTMA,
    when: (ctx) => ctx.get($appState.type) === 'tma',
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
