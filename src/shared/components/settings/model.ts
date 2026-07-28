import { action, atom, withAssign, withReset } from "@reatom/framework";
import { withUndo } from "@reatom/undo";
import { searchParamsAtom } from '@reatom/url'
import { navigate } from "../../../lib/router/utils";
import { withLocalStorage } from "@reatom/persist-web-storage";

export const $settings = atom(null, "settings").pipe(
  withAssign((_, name) => ({
    // list: atom<Settings>({}, "settings").pipe(
    //   withInit((ctx) => defineSettings(ctx))
    // ),
    preferences: atom(null, `${name}.preferences`).pipe(
      withAssign((_, name) => ({
        animations: atom(true, `${name}.animations`).pipe(withLocalStorage("withAnimations"), withReset())
      }))
    ),
    currentSection: searchParamsAtom.lens("a", { path: "/settings" }).pipe(
      withUndo({ length: 50 })
    ),
    to: action((_, target: string) => {
      navigate("/settings", { a: target })
    }),
    back: action((ctx) => {
      $settings.currentSection.undo(ctx)
    })
  }))
)

export const DEFAULT_SETTINGS_NODE_KEY = "default" as const

export const currentSectionIsDefault = (target: string) => {
  if (target === '' || target === DEFAULT_SETTINGS_NODE_KEY) return true
  return false
}

if (import.meta.env.DEV) {
  $settings.currentSection.__reatom.name = `settings.currentSection`;
  $settings.currentSection.onChange((_, s) => console.log($settings.currentSection.__reatom.name, s))
  $settings.preferences.animations.onChange((_, s) => console.log($settings.preferences.animations.__reatom.name, s))
}
