import type { ComponentRef, RouteConfig } from "./types"
import { RedirectError } from "./config"
import { getReatomCtx } from "../app/ctx"
import { urlAtom } from "@reatom/url"
import { lazy, type Component } from "solid-js";
import { lazyComponent } from "../helpers";

type ComponentRefKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends ComponentRef<any> ? K : never
}[keyof T];

type UnwrapComponentRef<T> = NonNullable<T> extends ComponentRef<infer C> ? C : never;

type DefineComponents<T> = {
  [K in ComponentRefKeys<T>]-?: UnwrapComponentRef<T[K]>
};

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T];

type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

type DefineRouteComponents<T> =
  Pick<DefineComponents<T>, RequiredKeys<Pick<T, ComponentRefKeys<T>>>> &
  Partial<Pick<DefineComponents<T>, OptionalKeys<Pick<T, ComponentRefKeys<T>>>>>

type DefineRouteConfig = Omit<RouteConfig, ComponentRefKeys<RouteConfig>> & {
  render: DefineRouteComponents<RouteConfig>
};

const wrapComponent = <T extends Function>(
  value?: T,
): ComponentRef<T> | undefined =>
  value
    ? { value }
    : undefined;

export function defineRoute(
  _: string, { render, ...config }: DefineRouteConfig,
) {
  const route: RouteConfig = {
    ...config,
    page: {
      value: render.page,
    },
    fallback: wrapComponent(render.fallback),
    layout: wrapComponent(render.layout),
    loader: wrapComponent(render.loader),
  };

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

export const asDeferred = lazyComponent
