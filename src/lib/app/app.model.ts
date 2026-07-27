import { atom, withAssign } from "@reatom/framework";

// #region app
type AppState = {
  type: "standalone" | "tma"
}

export const $appState = atom(null, "appState").pipe(
  withAssign((_, name) => ({
    meta: {
      type: atom<AppState["type"]>("standalone", `${name}.meta.type`),
      version: atom(0, `${name}.meta.version`)
    },
  }))
)

// #endregion
