import { loadProfiles } from "./shared/components/feed/model"
import { Introduction } from "./shared/components/introduction"
import { Index, IndexFallback } from "./shared/components/feed"
import { NotFound } from "./shared/components/templates/not-found"
import { reatomRouteAction } from "./lib/reatom"

export const routes = [
  {
    path: '/',
    action: reatomRouteAction((ctx) => {
      loadProfiles(ctx);

      return {
        component: Index,
        fallback: IndexFallback
      }
    }, "feed")
  },
  {
    path: '/intro',
    action: reatomRouteAction(() => {
      return {
        component: Introduction,
      }
    }, "intro")
  },
  {
    path: '/*all',
    action: () => ({
      component: NotFound,
    })
  },
]
