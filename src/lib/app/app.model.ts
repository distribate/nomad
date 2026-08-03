import { action, atom, withAssign } from "@reatom/framework";
import { $isAuthed } from "../user/user.model";
import { navigate } from "../router/utils";
import { watch, watchersModel } from "./watchers";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { withLog } from "../reatom/extensions";

// #region app
type AppState = {
  type: "standalone" | "tma"
}

export const LOCALES = {
  "en-US": { label: "English", lang: "en" },
  "ru-RU": { label: "Русский", lang: "ru" },
  "es-ES": { label: "Español", lang: "es" },
} as const;

type LocaleCode = keyof typeof LOCALES;

const DEFAULT_LOCALE: LocaleCode = "en-US";

export const $locale = atom<LocaleCode>(DEFAULT_LOCALE, "locale").pipe(withLocalStorage("locale"));
export const $lang = atom((ctx) => LOCALES[ctx.spy($locale)].lang, "locale.lang");
export const $localeLabel = atom((ctx) => LOCALES[ctx.spy($locale)].label, "localeLabel");

export const $appState = atom(null, "appState").pipe(
  withAssign((_, name) => ({
    type: atom<AppState["type"]>("standalone", `${name}.type`),
    version: atom(0, `${name}.version`),
  }))
)

export const $appLoading = atom(true, "appLoading")

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
