import UniversalRouter, { type Routes } from "universal-router"
import { urlAtom } from "@reatom/url"
import { action, atom, reatomAsync, withAssign, withReset } from "@reatom/framework"
import type { RouteData, RouteEffects, RouteMeta, Router, RouterCtx, RouteRender } from "./types"
import { defineRouteRender } from "./core"
import { routerLog, updateRouterLog } from "./config"
import { invariant, withRule } from "utils/index"

let router: Router
let _routes: Routes = []

export const getRoutes = (): Routes => _routes
export const setRoutes = (newRoutes: Routes): void => {
  _routes = newRoutes
}
export const getRouter = (): Router => {
  invariant(router, "Router is not initialized")
  return router
}
export const getRouterCtx = (): RouterCtx =>
  getRouter().options.context!

const getAtomName = (p: string, c: string) => withRule(`${p}.${c}`, routerLog)

export const $route = atom(null, "route").pipe(
  withAssign((_, name) => ({
    render: atom(null, getAtomName(name, "render")).pipe(
      withAssign((_, name) => ({
        page: atom<RouteRender["page"] | null>(null, `${name}.page`),
        layout: atom<RouteRender["layout"] | null>(null, `${name}.layout`),
        fallback: atom<RouteRender["fallback"] | null>(null, `${name}.fallback`),
      }))
    ),
    effects: atom<RouteEffects>([], getAtomName(name, "effects")).pipe(withReset()),
    data: atom<RouteData | null>(null, getAtomName(name, "data")).pipe(withReset()),
    meta: atom<RouteMeta>({ withLoader: false }, getAtomName(name, "meta")).pipe(withReset()),
    /**
      Atom that indicates whether the initial route has been initialized.
    */
    isInited: atom(false, getAtomName(name, "isInited")),
    isLoading: atom(true, getAtomName(name, "isLoading")),
  }))
);

export const $routeLoading = atom((ctx) => {
  if (!ctx.spy($route.isInited)) return true;

  const routeMeta = ctx.spy($route.meta);

  if (routeMeta.withLoader) {
    return false;
  }

  return ctx.spy($route.isLoading);
})

export const $router = atom(null, "router").pipe(
  withAssign((_, name) => ({
    _create: action(async (ctx, { log }: { log: boolean }) => {
      const routes = getRoutes();

      // @ts-expect-error
      router = new UniversalRouter(routes, {
        context: {
          reatomCtx: ctx,
        }
      })

      updateRouterLog(log)
    }, withRule(`${name}.create`, routerLog)),
    start: reatomAsync(async (ctx, { log }: { log: boolean }) => {
      // Disable name for urlAtom and urlAtom.settingsAtom if logging is disabled
      if (!log) {
        urlAtom.__reatom.name = `_${urlAtom.__reatom.name}`
        urlAtom.settingsAtom.__reatom.name = `_${urlAtom.settingsAtom.__reatom.name}`
      }

      await $router._create(ctx, { log })

      // initial route render
      defineRouteRender(ctx)

      urlAtom.settingsAtom(ctx, {
        init: () => new URL(location.href),
        sync: (_ctx, url, replace) => {
          const href = url.pathname + url.search + url.hash

          if (replace) {
            history.replaceState({}, "", href)
          } else {
            history.pushState({}, "", href)
          }
        },
      });

      urlAtom.onChange((ctx) => defineRouteRender(ctx))
    }, withRule(`${name}.start`, routerLog))
  }))
)

if (import.meta.env.DEV && routerLog) {
  urlAtom.onChange((_, s) => console.log(urlAtom.__reatom.name, s))
}
