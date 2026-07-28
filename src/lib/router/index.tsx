import { routes } from "./routes"
import UniversalRouter from "universal-router"
import {
  action, atom, isAbort, reatomAsync, withAbort, withAssign, withReset, withStatusesAtom,
  type Ctx
} from "@reatom/framework"
import { withRule } from "../helpers"
import type { RouteBase, RouteMeta, RouteRender } from "./types"
import { RedirectError } from "./config"
import { getConfigVal } from "../../const/config"
import { updateFromSource, urlAtom } from "@reatom/url"

export type RouterCtx = { reatomCtx: Ctx }
export type Router = UniversalRouter<any, RouterCtx>;

let router: Router

const routeNameRule = getConfigVal("withAppRouterLog");
const getRouteAtomName = (parent: string, child: string) =>
  withRule(`${parent}.${child}`, routeNameRule)

export const $route = atom(null, "route").pipe(
  withAssign((_, name) => ({
    render: atom<RouteRender | null>(null, getRouteAtomName(name, "render")).pipe(withReset()),
    callbacks: atom<Pick<RouteBase, "onLeave"> | null>(null, getRouteAtomName(name, "callbacks")).pipe(withReset()),
    meta: atom<RouteMeta>({ withLoader: false }, getRouteAtomName(name, "meta")).pipe(withReset()),
    /*
      Atom that indicates whether the initial route has been initialized.
    */
    isInited: atom(false, getRouteAtomName(name, "isInited"))
  }))
);

export const $routeLoading = atom((ctx) => {
  if (!ctx.spy($route.isInited)) return true;

  const routeMeta = ctx.spy($route.meta);

  if (routeMeta.withLoader) {
    return false;
  }

  return ctx.spy(defineRouteRender.statusesAtom).isPending;
})

export const createRouter = action(async (ctx) => {
  // @ts-expect-error
  router = new UniversalRouter(routes, {
    context: {
      reatomCtx: ctx
    }
  })

  defineRouteRender(ctx).catch((err) => {
    if (!isAbort(err)) {
      console.error("Navigation error:", err)
    }
  });

  window.addEventListener("popstate", () => {
    updateFromSource(ctx, new URL(location.href))
  })

  urlAtom.settingsAtom(ctx, {
    init: () => new URL(location.href),
    sync: (_ctx, url, replace) => {
      const href = url.pathname + url.search + url.hash

      if (href === location.pathname + location.search + location.hash) {
        return
      }

      if (replace) {
        history.replaceState({}, "", href)
      } else {
        history.pushState({}, "", href)
      }

      updateFromSource(ctx, new URL(location.href))
    },
  })
}, withRule("createRouter", routeNameRule))

urlAtom.onChange((ctx, url) => {
  if (import.meta.env.DEV) {
    console.log(urlAtom.__reatom.name, url);
  }

  defineRouteRender(ctx)
})

const resolveRoute = async (ctx: Ctx, pathname: string, params?: Record<string, string>): Promise<void> => {
  $route.render.reset(ctx);
  $route.meta.reset(ctx);
  $route.callbacks.reset(ctx);

  try {
    const route = await router.resolve({ pathname, params }) as RouteBase;

    $route.isInited(ctx, true);

    await route.guard?.(ctx);

    if (route.loader) {
      $route.meta(ctx, (state) => ({ ...state, withLoader: true }));

      $route.render(ctx, (state) => ({
        ...state,
        component: route.loader!,
      }));
    }

    await route.onEnter?.(ctx);

    $route.callbacks(ctx, {
      onLeave: route.onLeave,
    })

    $route.render(ctx, {
      component: route.component,
      fallback: route.fallback,
    });
  } catch (e) {
    if (e instanceof RedirectError) {
      urlAtom(ctx, new URL(e.to, location.origin))
      return
    }

    throw e;
  }
};

export const defineRouteRender = reatomAsync(async (
  ctx,
  targetUrl?: string,
  params?: Record<string, string>,
) => {
  const currentUrl = ctx.get(urlAtom)

  const url = targetUrl ?? currentUrl.pathname

  const finalParams = targetUrl
    ? params
    : Object.fromEntries(currentUrl.searchParams.entries())

  const callbacks = ctx.get($route.callbacks);
  callbacks?.onLeave?.(ctx)

  await resolveRoute(ctx, url, finalParams)
}, withRule("defineRouteRender", routeNameRule)).pipe(
  withStatusesAtom(),
  withAbort({ strategy: "last-in-win" }),
)
