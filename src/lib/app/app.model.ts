import { action, atom, withAssign } from "@reatom/framework";
import { $isAuthed } from "../user/user.model";
import { navigate } from "../router/utils";
import { $routeLoading } from "../router";
import { watch, watchersModel } from "./watchers";

// #region app
type AppState = {
  type: "standalone" | "tma"
}

const getLang = () => {
  const locales = navigator.languages ?? [navigator.language];
  return locales[0];
}

export const $appState = atom(null, "appState").pipe(
  withAssign((_, name) => ({
    type: atom<AppState["type"]>("standalone", `${name}.type`),
    version: atom(0, `${name}.version`),
    preferredLang: atom(getLang(), `${name}.preferredLang`),
  }))
)

export const $appLoading = atom((ctx) => !!ctx.spy($routeLoading))

const appWatchers = watchersModel({
  name: "app",
  watchers: [
    watch($isAuthed, {
      condition: (isAuthed) => !isAuthed,
      handler: (_, isAuthed) => {
        !isAuthed && navigate("/intro");
      },
    }),
  ]
})

const defineWatchers = action((ctx) => {
  appWatchers.define(ctx)
}, "defineWatchers");

export const defineAppLifecycle = action(async (ctx) => {
  defineWatchers(ctx);
}, "defineAppLifecycle")
// #endregion
