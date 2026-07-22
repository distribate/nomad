import { atom, createCtx as createReatomCtx, reatomAsync, withAssign, withErrorAtom, withStatusesAtom } from "@reatom/framework";
import { rootLogger } from "../logger/logger.model";
import { $user } from "../user/user.model";

// #region app
function createCtx() {
  const ctx = createReatomCtx();
  rootLogger.info("Reatom ctx created")
  return ctx;
}
const ctx = createCtx();
export const getReatomCtx = () => ctx
// #endregion

// #region app
type AppState = {
  type: "standalone" | "tma"
}
type AppRoute =
  | "index"
  | "introduction"

export const $appState = atom(null, "appState").pipe(
  withAssign((_, name) => ({
    meta: {
      type: atom<AppState["type"]>("standalone", `${name}.meta.type`)
    },
    route: atom<AppRoute>("index", `${name}.route`)
  }))
)
export const defineInitialRoute = reatomAsync(async (ctx) => {
  const isAuthed = ctx.get($user.data)
  if (isAuthed) {
    $appState.route(ctx, "index");
    return;
  }

  $appState.route(ctx, "introduction");
}, "defineInitialRoute").pipe(
  withStatusesAtom(),
  withErrorAtom()
)

// #endregion
