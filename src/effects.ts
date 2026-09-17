import { action } from "@reatom/framework";
import { withAuth } from "./lib/user/user.model";
import { defineEffect } from "./lib/router";

export const withAuthEffect = defineEffect({
  phase: "beforeEnter",
  run: () => action((ctx) => withAuth(ctx)),
})
