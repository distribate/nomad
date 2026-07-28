import type { AtomMut } from "@reatom/framework";
import { $appState } from "../app/app.model";
import { $gsapPlugins } from "../gsap";

export type BindingNode = AtomMut<any> | { [k: string]: BindingNode };

export type Bindings = {
  [scope: string]: BindingNode;
};

const BINDINGS = {
  app: {
    type: $appState.meta.type,
    version: $appState.meta.version,
    preferredLang: $appState.meta.preferredLang,
    gsap: {
      // @ts-expect-error
      plugins: $gsapPlugins
    }
  },
} satisfies Bindings;

export { BINDINGS }
