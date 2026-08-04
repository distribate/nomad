import { routes } from "./routes"
import UniversalRouter from "universal-router"
import {
  action, atom, isAbort, reatomAsync, withAbort, withAssign, withReset,
  type Ctx
} from "@reatom/framework"
import { withRule } from "../helpers"
import type { RouteEffects, RouteMeta, RouteRender } from "./types"
import { urlAtom } from "@reatom/url"
import { resolveRoute } from "./core"
import { routerNameRule } from "./config"

export type RouterCtx = { reatomCtx: Ctx }
export type Router = UniversalRouter<any, RouterCtx>;

let router: Router

export const getRouter = () => {
  if (!router) throw new Error("Router is not initialized")
  return router
}

const getRouteAtomName = (p: string, c: string) => withRule(`${p}.${c}`, routerNameRule)

export const $route = atom(null, "route").pipe(
  withAssign((_, name) => ({
    render: atom(null, getRouteAtomName(name, "render")).pipe(
      withAssign((_, name) => ({
        page: atom<RouteRender["page"] | null>(null, `${name}.page`),
        layout: atom<RouteRender["layout"] | null>(null, `${name}.layout`),
        fallback: atom<RouteRender["fallback"] | null>(null, `${name}.fallback`),
      }))
    ),
    effects: atom<RouteEffects>([], getRouteAtomName(name, "effects")).pipe(withReset()),
    meta: atom<RouteMeta>({ withLoader: false }, getRouteAtomName(name, "meta")).pipe(withReset()),
    /*
      Atom that indicates whether the initial route has been initialized.
    */
    isInited: atom(false, getRouteAtomName(name, "isInited")),
    isLoading: atom(true, getRouteAtomName(name, "isLoading")),
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

const createRouter = action(async (ctx, { onCreate }: { onCreate: () => void }) => {
  // @ts-expect-error
  router = new UniversalRouter(routes, {
    context: {
      reatomCtx: ctx
    }
  })

  onCreate();
}, withRule("createRouter", routerNameRule))

export const startRouter = reatomAsync(async (ctx) => {
  // Disable name for urlAtom and urlAtom.settingsAtom if logging is disabled
  if (!routerNameRule) {
    urlAtom.__reatom.name = `_${urlAtom.__reatom.name}`
    urlAtom.settingsAtom.__reatom.name = `_${urlAtom.settingsAtom.__reatom.name}`
  }

  await createRouter(ctx, {
    onCreate: () => {
      defineRouteRender(ctx).catch((err) => {
        if (!isAbort(err)) {
          console.error("Navigation error:", err)
        }
      });

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
    }
  })
}, withRule("startRouter", routerNameRule))

const defineRouteRender = reatomAsync(async (ctx, params?: Record<string, string>) => {
  const currentUrl = ctx.get(urlAtom)
  const finalParams = currentUrl.pathname
    ? params : Object.fromEntries(currentUrl.searchParams.entries())

  await resolveRoute(ctx, currentUrl.pathname, finalParams)
}, withRule("defineRouteRender", routerNameRule)).pipe(
  withAbort({ strategy: "last-in-win" }),
)

if (import.meta.env.DEV && routerNameRule) {
  urlAtom.onChange((_, s) => console.log(urlAtom.__reatom.name, s))
}
