import type { Ctx } from "@reatom/framework"
import { getDevConfig } from "../dev/dev.model"
import { getHeapSizeMB } from "../helpers"
import { $modules as $bootModules } from "./boot"
import { getReatomCtx } from "./ctx"

const debugModules: Record<string, (ctx: Ctx) => Record<string, any> | any> = {
  ...(import.meta.env.DEV && { dev: getDevConfig }),
  modules: (ctx) => ctx.get($bootModules),
  memory: getHeapSizeMB
}

/**
 * Returns the current application configuration.
 * @debugQuery
 * @returns The configuration of all public modules.
 */
export function getAppConfig() {
  const ctx = getReatomCtx()
  const sum: Record<string, any> = {}
  for (const [k, cb] of Object.entries(debugModules)) sum[k] = cb(ctx)
  return sum
}
