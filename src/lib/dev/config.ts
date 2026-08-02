import { type Atom, type AtomMut, type Ctx } from "@reatom/framework";
import { $appState, $lang } from "../app/app.model";
import { $gsapIsEnabled, $gsapPlugins } from "../gsap";
import { getConfigVal } from "../../const/config";

export type BindingValue = string[] | Atom<any> | AtomMut<any>;

type BindingParams = {
  // Condition for showing this binding
  condition?: (ctx: Ctx) => boolean,
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
      plugins: createBinding($gsapPlugins, { condition: (ctx) => ctx.get($gsapIsEnabled) })
    },
  },
  config: {
    logRouter: createBinding(getConfigVal("withAppRouterLog", { as: "atom" }), { readonly: false }),
    logActions: createBinding(getConfigVal("withAppActionsLog", { as: "atom" }), { readonly: false }),
    logRefAtom: createBinding(getConfigVal("withRefAtomLog", { as: "atom" }), { readonly: false }),
  }
} satisfies Bindings;

export { BINDINGS }
