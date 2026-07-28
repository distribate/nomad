import type { Action, AsyncAction } from "@reatom/framework"
import type { Component } from "solid-js"

export type RouteBase = RouteConfig

export type RouteRender = Pick<RouteBase, "component" | "fallback">

type RouteEventCb = Action<[], any> | AsyncAction<[], any>;

export type RouteConfig = {
  guard?: RouteEventCb,
  onEnter?: RouteEventCb,
  onLeave?: RouteEventCb,
  component: Component,
  fallback?: Component,
  loader?: Component,
}

export type RouteMeta = {
  withLoader: boolean,
  pathname: string,
  params: Record<string, string>,
}
