import { action, atom, isAtom, withAssign, type Ctx, type Unsubscribe } from "@reatom/framework";
import { FolderApi, Pane } from "tweakpane";
import { BINDINGS, type BindingNode, type BindingValue } from ".";
import type { BindingApi } from "@tweakpane/core";
import { expose, isError, isPrimitive } from "../utils";
import { getReatomCtx } from "../app/ctx";
import { $devPaneIsEnabled } from "../../const/config";
import { watch, watchersModel } from "../app/watchers";

let pane: Pane | null = null;
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
  isReadonly = true,
) {
  if (isConditionalBinding(node)) {
    if (node.condition && !node.condition(ctx)) return;

    const effectiveReadonly = node.readonly ?? isReadonly;
    return renderBindingNode(ctx, container, node.target, keyName, effectiveReadonly);
  }

  const val = isAtom(node) ? ctx.get(node) : node;

  if (isPrimitive(val) || Array.isArray(val)) {
    const binding = container.addBinding(
      { [keyName]: formatter(val) },
      keyName,
      { readonly: isReadonly }
    );

    if (!isReadonly) {
      binding.on("change", (ev) => {
        if (isAtom(node)) {
          // @ts-expect-error
          node(ctx, ev.value)
        }
      })
    }

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
      pane = new Pane();

      pane.element.style.zIndex = "1000";
      pane.element.style.position = "fixed";
      pane.element.style.right = "4px";
      pane.element.style.top = "4px";
      pane.element.style.overflow = "auto"
      pane.element.style.maxWidth = window.innerWidth * 0.7 + "px";

      function startBindNodes() {
        if (!pane) return;

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
    }, `${name}.initPane`),
    start: action((ctx) => {
      $dev.initPane(ctx);
      devWatchers.define(ctx);
    }, `${name}.start`),
    disposePane: () => {
      if (!pane) {
        console.log("pane is not initialized");
        return;
      }

      pane.dispose();
      pane = null;
    }
  }))
)

const devWatchers = watchersModel({
  name: "dev",
  watchers: [
    watch($devPaneIsEnabled, {
      handler: (ctx, value) => !value ? $dev.disposePane() : $dev.initPane(ctx)
    })
  ]
})

expose(function togglePane() {
  $devPaneIsEnabled(getReatomCtx(), s => !s)
})
