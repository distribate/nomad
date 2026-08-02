import { action, atom, withAssign, withReset } from "@reatom/framework";
import { withUndo } from "@reatom/undo";
import { searchParamsAtom } from '@reatom/url'
import { navigate } from "../../../lib/router/utils";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { withLog } from "../../../lib/reatom/extensions";

export const DEFAULT_SETTINGS_NODE_KEY = "default" as const

export const $settings = atom(null, "settings").pipe(
  withAssign((_, name) => ({
    // list: atom<Settings>({}, "settings").pipe(
    //   withInit((ctx) => defineSettings(ctx))
    // ),
    preferences: atom(null, `${name}.preferences`).pipe(
      withAssign((_, name) => ({
        animations: atom(true, `${name}.animations`).pipe(
          withLocalStorage("withAnimations"),
          withReset(),
          withLog()
        )
      })),
    ),
    currentSection: searchParamsAtom.lens("a", { path: "/settings" }).pipe(
      withUndo({ length: 50 }),
      withLog()
    ),
    to: action((_, target: string) => {
      navigate("/settings", { a: target })
    }),
    back: action((ctx) => {
      const isUndo = ctx.get($settings.currentSection.isUndoAtom)

      if (isUndo) {
        $settings.currentSection.undo(ctx)
      } else {
        navigate("/settings", { a: DEFAULT_SETTINGS_NODE_KEY })
      }
    })
  }))
)

export const currentSectionIsDefault = (target: string) => {
  if (target === '' || target === DEFAULT_SETTINGS_NODE_KEY) return true
  return false
}

$settings.currentSection.__reatom.name = `settings.currentSection`
