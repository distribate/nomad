import type { BindingApi } from "@tweakpane/core";
import { FolderApi, Pane } from "tweakpane";
import { action, atom, isAtom, withAssign, type Ctx, type Unsubscribe } from "@reatom/framework";
import { BINDINGS, type BindingNode, type BindingParams, type BindingValue } from "./config";
import { expose, isError, isPrimitive } from "../utils";
import { watch, watchersModel } from "../app/watchers";
import { getReatomCtx } from "../app/ctx";

const $devPaneIsEnabled = atom(import.meta.env.DEV, "devPane")

let instance: Pane | null = null;
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

function isConditionalBinding(node: BindingNode): node is { target: BindingValue } & Pick<BindingParams, "when"> {
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
    if (node.when && !node.when(ctx)) return;

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

export const $pane = atom(null, "pane").pipe(
  withAssign((_, name) => ({
    init: action((ctx) => {
      instance = new Pane();

      instance.element.style.zIndex = "1000";
      instance.element.style.position = "fixed";
      instance.element.style.right = "4px";
      instance.element.style.top = "4px";
      instance.element.style.overflow = "auto"
      instance.element.style.maxWidth = window.innerWidth * 0.7 + "px";

      function startBindNodes() {
        if (!instance) return;

        // root folder for convenient folding
        const rootFolder = instance.addFolder({ title: "dev", expanded: false });

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
      $pane.init(ctx);
      devWatchers.define(ctx);
    }, `${name}.start`),
    dispose: () => {
      if (!instance) {
        console.log("pane is not initialized");
        return;
      }

      instance.dispose();
      instance = null;
    }
  }))
)

const devWatchers = watchersModel({
  name: "pane",
  watchers: [
    watch($devPaneIsEnabled, {
      handler: (ctx, value) => !value ? $pane.dispose() : $pane.init(ctx)
    })
  ]
})

expose(function togglePane() {
  $devPaneIsEnabled(getReatomCtx(), s => !s)
})
