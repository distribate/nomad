import { routes } from "./routes"
import UniversalRouter from "universal-router"
import {
  action, atom, isAbort, reatomAsync, withAbort, withAssign, withReset, withStatusesAtom,
  type Ctx
} from "@reatom/framework"
import { withRule } from "../helpers"
import type { RouteBase, RouteMeta, RouteRender } from "./types"
import { RedirectError } from "./config"
import { config } from "../../const/config"

export type RouterCtx = { reatomCtx: Ctx }
export type Router = UniversalRouter<any, RouterCtx>;

let router: Router

export const $route = atom(null, "route").pipe(
  withAssign((_, name) => ({
    render: atom<RouteRender | null>(null, withRule(`${name}.render`, config.withAppRouterLog)).pipe(
      withReset()
    ),
    callbacks: atom<Pick<RouteBase, "onLeave"> | null>(null, withRule(`${name}.callbacks`, config.withAppRouterLog)).pipe(
      withReset()
    ),
    meta: atom<RouteMeta>({ withLoader: false, params: {}, pathname: "/" }, withRule(`${name}.meta`, config.withAppRouterLog)).pipe(
      withReset()
    )
  }))
);

/*
  Atom that indicates whether the initial route has been initialized.
*/
export const $routeInited = atom(false);

export const $routeLoading = atom((ctx) => {
  if (!ctx.spy($routeInited)) return true;

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
    defineRouteRender(ctx).catch((err) => {
      if (!isAbort(err)) {
        console.error("Navigation error:", err)
      }
    });
  })
}, withRule("createRouter", config.withAppRouterLog))

const resolveRoute = async (ctx: Ctx, pathname: string, params?: Record<string, string>): Promise<void> => {
  $route.render.reset(ctx);
  $route.meta.reset(ctx);
  $route.callbacks.reset(ctx);

  try {
    $route.meta(ctx, (state) => ({ ...state, params: params ?? {} }));

    const route = await router.resolve({ pathname, params }) as RouteBase;

    $route.meta(ctx, (state) => ({ ...state, pathname }));
    $routeInited(ctx, true);

    if (pathname !== window.location.pathname) {
      history.pushState({}, "", pathname);
    }

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
      return resolveRoute(ctx, e.to);
    }

    throw e;
  }
};

export const defineRouteRender = reatomAsync(async (ctx, targetUrl?: string, params?: Record<string, string>) => {
  const url = targetUrl ?? window.location.pathname;

  const callbacks = ctx.get($route.callbacks);
  callbacks?.onLeave?.(ctx)

  await resolveRoute(ctx, url, params)
}, withRule("defineRouteRender", config.withAppRouterLog)).pipe(
  withStatusesAtom(),
  withAbort({ strategy: "last-in-win" }),
)
