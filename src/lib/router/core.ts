import { action } from "@reatom/framework";
import { urlAtom } from "@reatom/url";
import type { RouteConfig, RouteEffectPhase } from "./types";
import { $route, getRouter } from ".";
import { RedirectError, routerNameRule } from "./config";
import { withRule } from "../helpers";

const runEffects = action(async (ctx, phase: RouteEffectPhase) => {
  const effects = ctx.get($route.effects)

  for (const effect of effects) {
    if (effect.phase !== phase)
      continue

    await effect.run(ctx)
  }
}, withRule("runEffects", routerNameRule))

export const resolveRoute = action(async (
  ctx, pathname: string, params?: Record<string, string>
): Promise<void> => {
  await runEffects(ctx, "beforeLeave")

  $route.meta.reset(ctx);
  $route.effects.reset(ctx);

  try {
    const router = getRouter();

    const route = await router.resolve({
      pathname,
      params
    }) as RouteConfig;

    !route.layout && $route.isLoading(ctx, true);

    route.effects && $route.effects(ctx, route.effects);

    await runEffects(ctx, "beforeEnter")

    $route.render.layout(ctx, route.layout);
    route.fallback && $route.render.fallback(ctx, route.fallback)

    if (route.loader) {
      $route.meta(ctx, (state) => ({ ...state, withLoader: true }));
      $route.render.page(ctx, route.loader);
    }

    $route.render.page(ctx, route.page)
    await runEffects(ctx, "afterEnter")

    $route.isInited(ctx, true);
  } catch (e) {
    if (e instanceof RedirectError) {
      urlAtom(ctx, new URL(e.to, location.origin))
      return
    }

    throw e;
  } finally {
    $route.isLoading(ctx, false);
  }
}, withRule("resolveRoute", routerNameRule))
