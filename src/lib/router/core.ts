import { action } from "@reatom/framework";
import { urlAtom } from "@reatom/url";
import type { RouteBase, RouteCallbacks } from "./types";
import { $route, getRouter } from ".";
import { RedirectError, routerNameRule } from "./config";
import { withRule } from "../helpers";

const resolvePrevRouteCbs = action(async (ctx, cbs: RouteCallbacks) => {
  return async () => {
    const filtered = Object.values(cbs).filter(Boolean);

    for (const cb of filtered) {
      await cb(ctx)
    }
  }
}, withRule("resolvePrevRouteCbs", routerNameRule))

export const resolveRoute = action(async (ctx, pathname: string, params?: Record<string, string>): Promise<void> => {
  const cbs = ctx.get($route.callbacks)

  let resolvePrevCbs: Awaited<ReturnType<Awaited<typeof resolvePrevRouteCbs>>> | undefined;

  if (cbs) {
    resolvePrevCbs = await resolvePrevRouteCbs(ctx, cbs);
  }

  $route.render.reset(ctx);
  $route.meta.reset(ctx);
  $route.callbacks.reset(ctx);

  try {
    const router = getRouter();
    const route = await router.resolve({ pathname, params }) as RouteBase;

    await resolvePrevCbs?.();

    $route.isInited(ctx, true);

    await route.guard?.(ctx);

    if (route.loader) {
      $route.meta(ctx, (state) => ({ ...state, withLoader: true }));
      $route.render(ctx, (state) => ({ ...state, component: route.loader! }));
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
}, withRule("resolveRoute", routerNameRule))
