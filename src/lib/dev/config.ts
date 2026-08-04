import { type Atom, type AtomMut, type Ctx } from "@reatom/framework";
import { $appState, $lang } from "../app/app.model";
import { $gsapIsEnabled, $gsapPlugins } from "../gsap";
import { getConfigVal } from "../../const/config";
import { STATIC_CONFIG_KEYS } from "./const";

export type BindingValue = string[] | Atom<any> | AtomMut<any>;

export type BindingParams = {
  // Condition for showing this binding
  when?: (ctx: Ctx) => boolean,
  readonly?: boolean
}
export type BindingNode =
  | BindingValue
  | ({
    target: BindingValue,
  } & BindingParams)
  | { [k: string]: BindingNode };

export type Bindings = {
  [scope: string]: BindingNode;
};

function createBinding(target: BindingValue, params: BindingParams) {
  return { target, ...params };
}

const BINDINGS = {
  app: {
    type: $appState.type,
    version: $appState.version,
    lang: $lang,
    gsap: {
      enabled: $gsapIsEnabled,
      plugins: createBinding($gsapPlugins, { when: (ctx) => ctx.get($gsapIsEnabled) })
    },
  },
  config: {
    logRouter: createBinding(getConfigVal(STATIC_CONFIG_KEYS.LOG_ROUTER, { as: "atom" }), { readonly: false }),
    logActions: createBinding(getConfigVal(STATIC_CONFIG_KEYS.LOG_APP_ACTIONS, { as: "atom" }), { readonly: false }),
    logRefAtom: createBinding(getConfigVal(STATIC_CONFIG_KEYS.LOG_REF_ATOM, { as: "atom" }), { readonly: false }),
    logDevAtom: createBinding(getConfigVal(STATIC_CONFIG_KEYS.LOG_DEV, { as: "atom" }), { readonly: false }),
    featureInspector: createBinding(getConfigVal(STATIC_CONFIG_KEYS.FEATURE_INSPECTOR, { as: "atom" }), { readonly: false }),
    gsap: createBinding(getConfigVal(STATIC_CONFIG_KEYS.GSAP, { as: "atom" }), { readonly: false })
  }
} satisfies Bindings;

export { BINDINGS }
