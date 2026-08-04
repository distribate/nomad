import { action, atom, reatomMap, withAssign, withReset, type AtomMut, type Ctx } from "@reatom/framework";
import { withUndo } from "@reatom/undo";
import { searchParamsAtom } from '@reatom/url'
import { navigate } from "../../../lib/router/utils";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { withLog } from "../../../lib/reatom/extensions";
import { useCtx } from "@reatom/npm-solid-js";
import { useAtomAccessor } from "../../../lib/reatom";
import { declareModel } from "../../../lib/helpers";
import { $user, type User } from "../../../lib/user/user.model";
import type { Accessor } from "solid-js";

export const SETTINGS_SECTION_KEYS = {
  DEFAULT: "default",
  ACCOUNT: "account",
  PREFERENCES: "preferences",
  LANGUAGE: "language",
} as const;

export const DEFAULT_SETTINGS_NODE_KEY = SETTINGS_SECTION_KEYS.DEFAULT

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

//#region
export type AccountField = "firstName" | "photo";

export const {
  $accountFieldsMap, getOrCreateFieldAtom, resetAccountForm, useField, initFields
} = declareModel("account", ({ name }) => {
  const $accountFieldsMap = reatomMap<AccountField, AtomMut<string>>(
    new Map(), name("accountFields")
  )

  const initFields = (ctx: Ctx) => {
    const me = ctx.get($user.data);

    if (!me) {
      console.warn("me is null")
      return;
    }

    getOrCreateFieldAtom(ctx, "firstName", me.firstName);
    getOrCreateFieldAtom(ctx, "photo", me.photo?.src!);
  }

  const getOrCreateFieldAtom = (ctx: Ctx, fieldName: AccountField, initialValue = "") => {
    const map = ctx.get($accountFieldsMap);

    if (map.has(fieldName)) {
      return map.get(fieldName)!;
    }

    const $field = atom(initialValue, `accountField.${fieldName}`);
    $accountFieldsMap.set(ctx, fieldName, $field);

    return $field;
  }

  const resetAccountForm = action((ctx) => {
    $accountFieldsMap.clear(ctx);
  }, name("resetAccountForm"));

  const useField = (name: AccountField, initialValue = "") => {
    const ctx = useCtx();
    const $field = getOrCreateFieldAtom(ctx, name, initialValue);

    const value = useAtomAccessor($field);
    const onChange = (newValue: string) => $field(ctx, newValue);

    return [value, onChange] as const;
  }

  return {
    $accountFieldsMap,
    getOrCreateFieldAtom,
    useField,
    resetAccountForm,
    initFields
  }
})
//#endregion
