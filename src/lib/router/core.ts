import { action, pick, reatomAsync } from "@reatom/framework";
import { urlAtom } from "@reatom/url";
import type { RouteData, RouteEffectPhase } from "./types";
import { $route, getRouter, getRoutes } from ".";
import { RedirectError, routerNameRule } from "./config";
import { createPerfTimer, withRule } from "../helpers";
import type { ResolvedRouteConfig } from "./types";
import { matchPath, parseSearchParams, serializeSearchParams, type NestedSearchParams } from "./utils";
import { withCallParams } from "@distribate/reatom-kit";

type RunEffectsArgs =
  | [phase: RouteEffectPhase, data: RouteData]

const runEffects = reatomAsync(async (ctx, ...args: RunEffectsArgs) => {
  const perf = import.meta.env.DEV ? createPerfTimer() : null

  perf?.start()

  const [phase, resolvedRoute] = args
  const effects = ctx.get($route.effects)

  for (const effect of effects) {
    if (effect.phase !== phase)
      continue

    await effect.run(resolvedRoute)(ctx)
  }

  perf?.end()

  return perf?.value
}, withRule("runEffects", routerNameRule)).pipe(
  withCallParams()
)

export const resolveRoute = action(async (
  ctx, pathname: string, searchParams?: NestedSearchParams,
): Promise<void> => {
  const $data = ctx.get($route.data);

  if ($data) {
    const resolved = pick($data, ["params", "search"]);
    await runEffects(ctx, "onLeave", resolved)
  }

  $route.meta.reset(ctx);
  $route.effects.reset(ctx);

  try {
    const router = getRouter();

    const formalPathname = new URL(pathname, window.location.origin)
    formalPathname.search = searchParams
      ? serializeSearchParams(searchParams)
      : ""

    const resolvedRoute = await router.resolve(formalPathname.pathname) as ResolvedRouteConfig;

    if (!resolvedRoute.layout) {
      $route.isLoading(ctx, true);
    };

    resolvedRoute.effects && $route.effects(ctx, resolvedRoute.effects);

    const routes = getRoutes();
    const routeDeclaration = routes.find(d => d.name === resolvedRoute.name);

    const pathParams = routeDeclaration?.path
      ? matchPath(routeDeclaration.path as string, pathname)
      : null;

    const routeData: RouteData = {
      params: pathParams,
      search: parseSearchParams(formalPathname.searchParams)
    };

    await runEffects(ctx, "beforeEnter", routeData)

    $route.render.layout(ctx, resolvedRoute.layout ?? null);
    $route.render.fallback(ctx, resolvedRoute.fallback ?? null)

    if (resolvedRoute.loader) {
      $route.meta(ctx, (state) => ({ ...state, withLoader: true }));
      $route.render.page(ctx, resolvedRoute.loader);
    }

    $route.render.page(ctx, resolvedRoute.page)

    await runEffects(ctx, "afterEnter", routeData);

    $route.data(ctx, routeData);
    $route.isInited(ctx, true);
  } catch (e) {
    if (e instanceof RedirectError) {
      if (routerNameRule) {
        console.log(
          `%cRedirecting from ${pathname} to ${e.to}`,
          'color: #e6a23c; font-weight: bold; font-size: 12px;'
        )
      }

      urlAtom(ctx, new URL(e.to, location.origin))
      return
    }

    throw e;
  } finally {
    $route.isLoading(ctx, false);
  }
}, withRule("resolveRoute", routerNameRule))

if (import.meta.env.DEV) {
  runEffects.onCall((_, __, params) => routerNameRule &&
    console.log(`[${params[0]}]`, `->`))
  runEffects.onFulfill.onCall((ctx, __, duration) => routerNameRule &&
    console.log(`[${ctx.get(runEffects.callParamsAtom)[0]}]`, `<-`, `${duration}ms`))
}
