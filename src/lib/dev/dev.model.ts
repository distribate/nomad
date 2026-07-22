import { action, atom, isAtom, withAssign, type AtomMut } from "@reatom/framework";
import { Pane } from "tweakpane";
import { $appState } from "../app/app.model";

const pane = new Pane();

type Bindings = {
  [scope: string]: { [name: string]: AtomMut<any> } | AtomMut<any>
}

const BINDINGS = {
  app: {
    type: $appState.meta.type
  },
} satisfies Bindings;

export const $dev = atom(null, "dev").pipe(
  withAssign((_, name) => ({
    initPane: action((ctx) => {
      for (const [scope, bindings] of Object.entries(BINDINGS)) {
        const getBindingName = (scope: string, name: string) => `${scope}.${name}`;

        if (isAtom(bindings)) {
          const bindingName = getBindingName(scope, name)
          pane.addBinding({ [bindingName]: ctx.get(bindings) }, bindingName)
        } else {
          const folder = pane.addFolder({ title: scope });

          for (const [name, variable] of Object.entries(bindings)) {
            folder.addBinding({ [name]: ctx.get(variable) }, name)
          }
        }
      }
    }, `${name}.initPane`)
  }))
)
