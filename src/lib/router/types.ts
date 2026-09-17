import type { Action, AsyncAction, Ctx } from "@reatom/framework"
import type { Component, ParentComponent } from "solid-js"
import type UniversalRouter from "universal-router";
import type { NestedSearchParams } from "./utils";

export type RouterCtx = { reatomCtx: Ctx }
export type Router = UniversalRouter<any, RouterCtx>;

export type RouteEffectPhase =
  | "onLeave"
  | "beforeEnter"
  | "afterEnter";

type RouteAction =
  | Action<[], any>
  | AsyncAction<[], any>

export type RoutePathParams = Record<string, string> | null
export type RouteData = {
  params: RoutePathParams,
  search: NestedSearchParams,
}

export type RouteEffect = {
  phase: RouteEffectPhase,
  run: (routePayload: RouteData) => RouteAction
}
export type RouteEffects = RouteEffect[];

export type RouteRender = Pick<RouteConfig, "page" | "fallback" | "layout">

export type ComponentRef<T extends Function> = {
  value: T
}

export type RouteConfig = {
  loader?: ComponentRef<Component>,
  page: ComponentRef<Component>;
  layout?: ComponentRef<ParentComponent>;
  fallback?: ComponentRef<Component>;
  effects?: RouteEffects,
}
export type ResolvedRouteConfig = RouteConfig & { name: string };

export type RouteMeta = {
  withLoader: boolean
}
