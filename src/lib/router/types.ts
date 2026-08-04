import type { Action, AsyncAction } from "@reatom/framework"
import type { Component, ParentComponent } from "solid-js"

export type RouteEffectPhase =
  | "beforeLeave"
  | "afterLeave"
  | "beforeEnter"
  | "afterEnter";

export type RouteEffect = {
  phase: RouteEffectPhase,
  run: Action<[], any> | AsyncAction<[], any>,
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

export type RouteMeta = {
  withLoader: boolean,
}
