import { action } from "@reatom/framework"
import type { RouteConfig } from "./types"
import { RedirectError } from "./config"
import { getConfigVal } from "../../const/config"
import { getReatomCtx } from "../app/ctx"
import { urlAtom } from "@reatom/url"

export function defineRoute(
  routeName: string,
  config: RouteConfig,
) {
  const maybe = <T extends (...args: any[]) => any>(cb?: T, name?: string) => (
    cb ? action(cb, getConfigVal("withAppRouterLog") ? `${routeName}.${name ?? "unknown"}` : "_") : undefined
  );

  const route = {
    ...config,
    guard: maybe(config.guard, "guard"),
    onEnter: maybe(config.onEnter, "onEnter"),
    onLeave: maybe(config.onLeave, "onLeave"),
  }

  return () => route
}

export const navigate = async (
  pathname: string,
  params?: Record<string, string | number | boolean | undefined | null>
) => {
  const ctx = getReatomCtx();

  const url = new URL(pathname, location.origin)

  Object.entries(params ?? {})
    .forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v))
      }
    })

  urlAtom(ctx, url)
}

export function redirect(to: string, replace = false): never {
  throw new RedirectError(to, replace);
}
