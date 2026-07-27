import { routes } from "./routes"
import UniversalRouter from "universal-router"
import { action, atom, type Ctx } from "@reatom/framework"
import type { Component } from "solid-js"

let router: UniversalRouter<any, { reatomCtx: Ctx }>

type AppRoute = {
  component: Component
}

export const $route = atom<AppRoute | null>(null, "route")

export const createRouter = action(async (ctx) => {
  router = new UniversalRouter(routes, {
    context: {
      reatomCtx: ctx
    }
  })

  const route = await router.resolve({
    pathname: window.location.pathname,
  })

  $route(ctx, route);

  window.addEventListener("popstate", () => {
    router.resolve({
      pathname: window.location.pathname,
    }).then((route) => {
      $route(ctx, route)
    })
  })
}, "createRouter")

export const navigate = action(async (ctx, url: string) => {
  history.pushState({}, "", url)

  const route = await router.resolve({
    pathname: location.pathname,
    query: Object.fromEntries(new URLSearchParams(location.search)),
  })

  $route(ctx, route)
})
