import type { AtomMut } from "@reatom/framework";
import { $appState } from "../app/app.model";
import { $setupedPlugins } from "../gsap";

export type BindingNode = AtomMut<any> | { [k: string]: BindingNode };

export type Bindings = {
  [scope: string]: BindingNode;
};

const BINDINGS = {
  app: {
    type: $appState.meta.type,
    version: $appState.meta.version,
    gsap: {
      plugins: $setupedPlugins
    }
  },
} satisfies Bindings;

export { BINDINGS }
