import { type Atom, type AtomMut, type Ctx } from "@reatom/framework";
import { $appState } from "../app/app.model";
import { $gsapIsEnabled, $gsapPlugins } from "../gsap";
import { getConfig } from "../../const/config";

export type BindingValue = string[] | Atom<any> | AtomMut<any>;

export type BindingNode =
  | BindingValue
  | { target: BindingValue, condition?: (ctx: Ctx) => boolean }
  | { [k: string]: BindingNode };

export type Bindings = {
  [scope: string]: BindingNode;
};

function createBinding(
  target: BindingValue,
  condition?: (ctx: Ctx) => boolean
) {
  return { target, condition };
}

const BINDINGS = {
  app: {
    type: $appState.meta.type,
    version: $appState.meta.version,
    preferredLang: $appState.meta.preferredLang,
    gsap: {
      enabled: $gsapIsEnabled,
      plugins: createBinding($gsapPlugins, (ctx) => ctx.get($gsapIsEnabled))
    },
  },
  // maybe editable fields (boolean=switch,str=input)?
  config: getConfig()
} satisfies Bindings;

export { BINDINGS }
