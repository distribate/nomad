import { createNoopProxy, exposePublic } from "../lib/utils"
import { getReatomCtx } from "../lib/app/ctx";
import { getConfigValue, getDevConfig } from "../lib/dev/dev.model";
import type { ConfigValOpts, DevFlag } from "../lib/dev/types";

export function getConfigVal(name: string, options: ConfigValOpts<'atom'> & { as: 'atom' }): DevFlag
export function getConfigVal(name: string, options?: ConfigValOpts<'val'>): boolean
export function getConfigVal(name: string, { as = 'val' }: { as?: 'val' | 'atom' } = {}) {
  const ctx = getReatomCtx();
  if (import.meta.env.DEV) return getConfigValue(ctx, name, { as })
  return as === 'atom' ? createNoopProxy() : false
}

const modules = {
  ...(import.meta.env.DEV && { dev: getDevConfig })
}

exposePublic(function getAppConfig() {
  const ctx = getReatomCtx()
  const sum: Record<string, any> = {}
  for (const [k, cb] of Object.entries(modules)) sum[k] = cb(ctx)
  return sum
}, "getAppConfig")
