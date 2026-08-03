import type { Ctx } from "@reatom/framework"
import { getDevConfig } from "./dev/dev.model"
import { $modules } from "./app/boot"
import { getReatomCtx } from "./app/ctx"
import { exposePublic } from "./utils"

const modules = {
  ...(import.meta.env.DEV && { dev: getDevConfig }),
  modules: (ctx: Ctx) => ctx.get($modules)
}

/**
 * Returns the current application configuration.
 * @debugQuery
 * @returns The configuration of all public modules.
 */
export function getAppConfig() {
  const ctx = getReatomCtx()
  const sum: Record<string, any> = {}
  for (const [k, cb] of Object.entries(modules)) sum[k] = cb(ctx)
  return sum
}

export function registerPublicApi() {
  exposePublic(getAppConfig, "getAppConfig");
}
