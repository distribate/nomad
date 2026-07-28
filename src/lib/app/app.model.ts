import { atom, withAssign } from "@reatom/framework";
import { $isAuthed } from "../user/user.model";
import { navigate } from "../router/utils";
import { $routeLoading } from "../router";

// #region app
type AppState = {
  type: "standalone" | "tma"
}

export const $appState = atom(null, "appState").pipe(
  withAssign((_, name) => ({
    meta: {
      type: atom<AppState["type"]>("standalone", `${name}.meta.type`),
      version: atom(0, `${name}.meta.version`),
      preferredLang: atom("ru", `${name}.meta.preferredLang`),
    },
  }))
)

export const $appLoading = atom((ctx) => !!ctx.spy($routeLoading))

// todo
// create global event handler for routing/some events

$isAuthed.onChange((ctx, state) => {
  if (!state) {
    navigate(ctx, "/intro")
  }
})

// #endregion
