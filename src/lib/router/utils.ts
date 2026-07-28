import { action, isAbort } from "@reatom/framework"
import type { RouteConfig } from "./types"
import { defineRouteRender } from "."
import { withRule } from "../helpers"
import { RedirectError } from "./config"
import { config as rootConfig } from "../../const/config"

export function defineRoute(
  routeName: string,
  config: RouteConfig,
) {
  const maybe = <T extends (...args: any[]) => any>(cb?: T, name?: string) => (
    cb ? action(cb, rootConfig.withAppRouterLog ? `${routeName}.${name ?? "unknown"}` : "_") : undefined
  );

  const route = {
    ...config,
    guard: maybe(config.guard, "guard"),
    onEnter: maybe(config.onEnter, "onEnter"),
    onLeave: maybe(config.onLeave, "onLeave"),
  }

  return () => route
}

export const parseQueryParams = (searchParams: URLSearchParams): Record<string, string> => {
  return Object.fromEntries(searchParams.entries());
};

export const navigate = action(async (
  ctx,
  url: string,
  params?: Record<string, string | number | boolean | undefined | null>
) => {
  let finalUrl = url;

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const qs = searchParams.toString();

    if (qs) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}${qs}`;
    }
  }

  if (finalUrl === window.location.pathname + window.location.search) return;

  const parsedUrl = new URL(finalUrl, window.location.origin);
  const queryParamsObj = parseQueryParams(parsedUrl.searchParams);
  const pathname = parsedUrl.pathname;

  return defineRouteRender(ctx, pathname, queryParamsObj).catch((err) => {
    if (!isAbort(err)) {
      console.error(err);
    }
  });
}, withRule("navigate", rootConfig.withAppRouterLog));

export function redirect(to: string, replace = false): never {
  throw new RedirectError(to, replace);
}
