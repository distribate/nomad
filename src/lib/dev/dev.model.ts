import { action, atom, connectLogger, createLogBatched, isAtom, withAssign } from "@reatom/framework";
import { FolderApi, Pane } from "tweakpane";
import { BINDINGS, type BindingNode } from ".";

let pane: Pane | null = null;

const isPrimitive = (val: any): val is string | number | boolean =>
  typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';

function renderBindingNode(
  container: Pane | FolderApi,
  node: BindingNode,
  keyName: string,
  ctx: any
) {
  if (isAtom(node)) {
    const val = ctx.get(node);

    if (isPrimitive(val)) {
      container.addBinding({ [keyName]: val }, keyName, { readonly: true });
    } else if (Array.isArray(val)) {
      container.addBinding(
        { [keyName]: val.join('\n') },
        keyName,
        { multiline: true, readonly: true }
      );
    } else {
      container.addBinding(
        { [keyName]: JSON.stringify(val) },
        keyName,
        { readonly: true }
      );
    }
    return;
  }

  if (typeof node === 'object' && node !== null) {
    const folder = container.addFolder({ title: keyName });

    for (const [childKey, childNode] of Object.entries(node)) {
      renderBindingNode(folder, childNode, childKey, ctx);
    }
  }
}

export const $dev = atom(null, "dev").pipe(
  withAssign((_, name) => ({
    initPane: action((ctx) => {
      pane = new Pane();

      try {
        for (const [scope, node] of Object.entries(BINDINGS)) {
          renderBindingNode(pane, node, scope, ctx);
        }
      } catch (e) {
        const err = e as Error
        console.error(`Error: "${err.message}", stack: ${err.stack}`)
      }
    }, `${name}.initPane`)
  }))
)

export const startReatomLogger = action((ctx) => {
  connectLogger(ctx, {
    showCause: true,
    skipUnnamed: false,
    log: createLogBatched(
      {
        debounce: 1,
        limit: 5000,
        getTimeStamp: () => new Date().toLocaleTimeString(),
        log: console.log,
        shouldGroup: true,
      },
    ),
  });
}, "startReatomLogger")
