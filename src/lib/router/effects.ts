import { action } from "@reatom/framework";
import type { RouteEffect } from "./types";
import { withAuth } from "../user/user.model";

export const withAuthEffect = (): RouteEffect => ({
  phase: "beforeEnter",
  run: action((ctx) => withAuth(ctx)),
})
