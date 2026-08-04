import { action, atom, reatomAsync, sleep, withAssign, withStatusesAtom } from "@reatom/framework";
import { $isAuthed } from "../user/user.model";
import { navigate } from "../router/utils";
import { watch, watchersModel } from "../helpers/watchers";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { isError } from "../utils";
import { baseLocale, type Locale } from "../../paraglide/runtime";

// #region app
type AppState = {
  type: "standalone" | "tma"
}

export const LANGUAGES = {
  "en": { label: "English" },
  "ru": { label: "Русский" },
} as const;

export const $locale = atom<Locale>(baseLocale, "locale").pipe(withLocalStorage("locale"));
export const $lang = atom<Locale>(baseLocale, "locale.lang");
export const $langLabel = atom((ctx) => LANGUAGES[ctx.spy($lang)].label, "langLabel");

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

export const defineAppLifecycle = action(async (ctx) => {
  appWatchers.define(ctx)
}, "defineAppLifecycle")
// #endregion

// todo: add sentry/something for error reporting
export const reportError = reatomAsync(async (ctx, e: unknown) => {
  const finalError = isError(e) ? e : new Error("Unknown error");

  await sleep(2000);

  console.error({
    cause: import.meta.env.DEV ? ctx.cause : undefined,
    finalError
  });
}, {
  name: "reportError",
  onFulfill: (ctx, res) => {

  }
}).pipe(
  withStatusesAtom()
)
