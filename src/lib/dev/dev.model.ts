import { action, atom, connectLogger, createLogBatched, isAtom, withAssign, type Ctx, type Unsubscribe } from "@reatom/framework";
import { FolderApi, Pane } from "tweakpane";
import { BINDINGS, type BindingNode, type BindingValue } from ".";
import { withRule } from "../helpers";
import { getConfigVal } from "../../const/config";
import type { BindingApi } from "@tweakpane/core";
import { isError, isPrimitive } from "../utils";

let subs: Map<string, Unsubscribe> = new Map()

const write = (binding: BindingApi) => {
  const target = binding.controller.value.binding.target;
  return target.write.bind(target);
};

const formatter = (val: unknown) => {
  if (Array.isArray(val)) {
    return val.join(", ");
  }
  return val;
};

function isConditionalBinding(
  node: BindingNode,
): node is { target: BindingValue; condition?: (ctx: Ctx) => boolean } {
  return (
    typeof node === "object" &&
    node !== null &&
    "target" in node
  );
}

function renderBindingNode(
  ctx: Ctx,
  container: Pane | FolderApi,
  node: BindingNode,
  keyName: string,
) {
  if (isConditionalBinding(node)) {
    if (node.condition && !node.condition(ctx)) return;

    return renderBindingNode(ctx, container, node.target, keyName);
  }

  const val = isAtom(node) ? ctx.get(node) : node;

  if (isPrimitive(val) || Array.isArray(val)) {
    const binding = container.addBinding(
      { [keyName]: formatter(val) },
      keyName,
      { readonly: true }
    );

    if (isAtom(node)) {
      const setValue = write(binding);

      const sub = ctx.subscribe(node, (state) => {
        setValue(formatter(state));
      });

      subs.set(`${container.title}.${keyName}`, sub);
    }

    return;
  }

  const folder = container.addFolder({ title: keyName });

  for (const [childKey, childNode] of Object.entries(node)) {
    renderBindingNode(ctx, folder, childNode, childKey);
  }
}

export const $dev = atom(null, "dev").pipe(
  withAssign((_, name) => ({
    initPane: action((ctx) => {
      const pane = new Pane();

      pane.element.style.zIndex = "1000";
      pane.element.style.position = "fixed";
      pane.element.style.right = "4px";
      pane.element.style.top = "4px";
      pane.element.style.overflow = "auto"

      function startBindNodes() {
        // root folder for convenient folding
        const rootFolder = pane.addFolder({ title: "dev", expanded: false });

        for (const [scope, node] of Object.entries(BINDINGS)) {
          renderBindingNode(ctx, rootFolder, node, scope);
        }
      }

      try {
        startBindNodes()
      } catch (e) {
        if (isError(e)) {
          console.error(`Error: "${e.message}", stack: ${e.stack}`)
        }
      }

      return { subs };
    }, `${name}.initPane`)
  }))
)

export const startReatomLogger = action((ctx) => {
  connectLogger(ctx, {
    showCause: true,
    skipUnnamed: true,
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
},
  withRule("startReatomLogger", getConfigVal("withAppActionsLog"))
)
