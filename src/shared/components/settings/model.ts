import {
  action, atom, batch, isAtom, reatomMap, withAssign, withReset,
  type Atom, type AtomMut, type Ctx
} from "@reatom/framework";
import { withUndo } from "@reatom/undo";
import { searchParamsAtom } from '@reatom/url'
import { navigate } from "../../../lib/router/utils";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { withLog } from "../../../lib/reatom/extensions";
import { useCtx } from "@reatom/npm-solid-js";
import { useAtomAccessor } from "../../../lib/reatom";
import { declareModel } from "../../../lib/helpers";
import { $user } from "../../../lib/user/user.model";
import { translate } from "../../../lib/app/locale";
import { $langLabel } from "../../../lib/app/app.model";

export const SETTINGS_SECTION_KEYS = {
  DEFAULT: "default",
  ACCOUNT: "account",
  PREFERENCES: "preferences",
  LANGUAGE: "language",
  PRIVACY: "privacy",
  PASSCODE: "passcode",
  DEVICES: "devices",
} as const;

export type SettingsSectionKey = typeof SETTINGS_SECTION_KEYS[keyof typeof SETTINGS_SECTION_KEYS];
type SettingsSectionMetaFields = "title" | "description"

const SETTINGS_SECTION_META = {
  [SETTINGS_SECTION_KEYS.DEFAULT]: {
    title: translate["settings.account"](),
    description: translate["settings.account_.description"](),
  },
  [SETTINGS_SECTION_KEYS.ACCOUNT]: {
    title: translate["settings.account"](),
    description: translate["settings.account_.description"](),
  },
  [SETTINGS_SECTION_KEYS.PREFERENCES]: {
    title: translate["settings.preferences"](),
    description: translate["settings.preferences_.description"](),
  },
  [SETTINGS_SECTION_KEYS.LANGUAGE]: {
    title: translate["settings.language"](),
    description: $langLabel,
  },
  [SETTINGS_SECTION_KEYS.PRIVACY]: {
    title: translate["settings.privacy"](),
    description: translate["settings.privacy_.description"](),
  },
  [SETTINGS_SECTION_KEYS.PASSCODE]: {
    title: translate["settings.passcode"](),
    description: translate["settings.passcode_.description"](),
  },
  [SETTINGS_SECTION_KEYS.DEVICES]: {
    title: translate["settings.devices"](),
    description: translate["settings.devices_.description"](),
  },
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

type MetaValue<
  T extends SettingsSectionKey, F extends SettingsSectionMetaFields
> = (typeof SETTINGS_SECTION_META)[T][F];

type IsAtomValue<
  T extends SettingsSectionKey, F extends SettingsSectionMetaFields
> = MetaValue<T, F> extends Atom<any> ? true : false;

export function getSectionField<
  T extends SettingsSectionKey, F extends SettingsSectionMetaFields
>(ctx: Ctx, target: T, field: F): string;
export function getSectionField<
  T extends SettingsSectionKey,
  F extends SettingsSectionMetaFields
>(target: IsAtomValue<T, F> extends true ? never : T, field: F): string;
export function getSectionField(
  arg1: Ctx | SettingsSectionKey,
  arg2: SettingsSectionKey | SettingsSectionMetaFields,
  arg3?: SettingsSectionMetaFields
): string {
  let ctx: Ctx | undefined;
  let target: SettingsSectionKey;
  let field: SettingsSectionMetaFields;

  if (typeof arg1 === "object" && arg1 !== null) {
    ctx = arg1 as Ctx;
    target = arg2 as SettingsSectionKey;
    field = arg3 as SettingsSectionMetaFields;
  } else {
    target = arg1 as SettingsSectionKey;
    field = arg2 as SettingsSectionMetaFields;
  }

  const section = SETTINGS_SECTION_META[target];
  if (!section) return "Unknown";

  const val = section[field];

  if (isAtom(val)) {
    if (!ctx) {
      throw new Error(`Ctx is required to read Atom field "${field}" in "${target}" section`);
    }
    return ctx.get(val);
  }

  return val;
}

export const currentSectionIsDefault = (target: string): boolean => {
  if (target === '' || target === DEFAULT_SETTINGS_NODE_KEY) return true
  return false
}

$settings.currentSection.__reatom.name = `settings.currentSection`

//#region
export type AccountField =
  | "firstName"
  | "photo"
  | "bio"
  | "style"
  | "interests"
  | "age";

export const {
  $accountFieldsMap, getOrCreateFieldAtom, resetAccountForm, useField, initFields
} = declareModel("account", ({ name }) => {
  const $accountFieldsMap = reatomMap<AccountField, AtomMut<string>>(
    new Map(), name("accountFields")
  )

  const initFields = action((ctx: Ctx) => {
    const me = ctx.get($user.data);

    if (!me) {
      console.warn("me is null")
      return;
    }

    batch(ctx, () => {
      getOrCreateFieldAtom(ctx, "firstName", me.firstName);
      getOrCreateFieldAtom(ctx, "photo", me.photo?.src!);
      getOrCreateFieldAtom(ctx, "bio", "");
      // @ts-expect-error
      getOrCreateFieldAtom(ctx, "style", me.style ?? null);
      // @ts-expect-error
      getOrCreateFieldAtom(ctx, "interests", me.interests);
      getOrCreateFieldAtom(ctx, "age", "18");
    })
  }, name("initFields"))

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
