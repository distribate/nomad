import { createNoopProxy, exposePublic } from "../lib/utils"
import { getReatomCtx } from "../lib/app/ctx";
import {
  getConfigValue, getDevConfig,
  type ConfigValOpts, type DevFlag
} from "../lib/dev/dev.model";

export function getConfigVal(name: string, options: ConfigValOpts<'atom'> & { as: 'atom' }): DevFlag
export function getConfigVal(name: string, options?: ConfigValOpts<'val'>): boolean
export function getConfigVal(name: string, { as = 'val' }: { as?: 'val' | 'atom' } = {}) {
  const ctx = getReatomCtx();
  return import.meta.env.DEV ? getConfigValue(ctx, name, { as }) : createNoopProxy()
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
