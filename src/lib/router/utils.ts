import type { ComponentRef, ResolvedRouteConfig, RouteConfig, RoutePathParams } from "./types"
import { RedirectError } from "./config"
import { getReatomCtx } from "../app/ctx"
import { urlAtom } from "@reatom/url"
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
  name: string, { render, ...config }: DefineRouteConfig,
): () => ResolvedRouteConfig {
  const route = {
    ...config,
    name,
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

export function matchPath (
  pattern: string,
  pathname: string,
): RoutePathParams {
  const patternSegments = pattern.split("/").filter(Boolean)
  const pathSegments = pathname.split("/").filter(Boolean)

  if (patternSegments.length !== pathSegments.length)
    return null

  const params: NonNullable<RoutePathParams> = {}

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]
    const pathSegment = pathSegments[i]

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = pathSegment
      continue
    }

    if (patternSegment !== pathSegment)
      return null
  }

  return params
}

export interface NestedSearchParams {
  [key: string]: string | NestedSearchParams
}

export const serializeSearchParams = (
  params: NestedSearchParams,
): string => {
  const search = new URLSearchParams()

  const append = (
    value: string | NestedSearchParams,
    key: string,
  ) => {
    if (typeof value === "string") {
      search.append(key, value)
      return
    }

    for (const [childKey, childValue] of Object.entries(value)) {
      append(childValue, `${key}[${childKey}]`)
    }
  }

  for (const [key, value] of Object.entries(params)) {
    append(value, key)
  }

  return search.toString()
}
export const parseSearchParams = (
  search: URLSearchParams,
): NestedSearchParams => {
  const result: NestedSearchParams = {}

  const setNested = (
    target: NestedSearchParams,
    keys: string[],
    value: string,
  ) => {
    const [key, ...rest] = keys

    if (!rest.length) {
      target[key] = value
      return
    }

    if (
      !target[key] ||
      typeof target[key] === "string"
    ) {
      target[key] = {}
    }

    setNested(
      target[key] as NestedSearchParams,
      rest,
      value,
    )
  }

  for (const [key, value] of search) {
    const keys = key
      .replace(/\]/g, "")
      .split("[")

    setNested(result, keys, value)
  }

  return result
}
