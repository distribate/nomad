import type { BindingApi } from "@tweakpane/core";
import { FolderApi, Pane } from "tweakpane";
import { action, atom, isAtom, withAssign, type Ctx, type Unsubscribe } from "@reatom/framework";
import { withLocalStorage } from "@reatom/persist-web-storage";
import { BINDINGS, type BindingNode, type BindingParams, type BindingValue } from "./config";
import { expose, isError, isPrimitive } from "../utils";
import { watch, watchersModel } from "../helpers/watchers";
import { getReatomCtx } from "../app/ctx";
import { getHeapSizeMB } from "../helpers";

const $devPaneIsEnabled = atom(import.meta.env.DEV, "devPane")

let instance: Pane | null = null;
// root folder for convenient folding
let rootFolder: FolderApi | null = null;
let subs: Map<string, Unsubscribe> = new Map()

export const writeToBindingValue = (binding: BindingApi) => {
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

type BindingOptions = {
  isReadonly: boolean
}

function renderBindingNode(
  ctx: Ctx,
  container: Pane | FolderApi,
  node: BindingNode,
  keyName: string,
  { isReadonly = true }: BindingOptions = { isReadonly: true }
) {
  if (isConditionalBinding(node)) {
    if (node.when && !node.when(ctx)) return;

    const effectiveReadonly = node.readonly ?? isReadonly;
    renderBindingNode(ctx, container, node.target, keyName, { isReadonly: effectiveReadonly });

    return;
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
      const setValue = writeToBindingValue(binding);

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

export const getRootFolder = (): FolderApi => {
  if (!rootFolder) {
    throw new Error("Root folder is not initialized");
  }
  return rootFolder;
}

export const tryGetRootFolder = (): FolderApi | null => {
  return rootFolder;
};

const devWatchers = watchersModel({
  name: "pane",
  watchers: [
    watch($devPaneIsEnabled, {
      handler: (ctx, value) => value ? $pane.init(ctx) : $pane.dispose(ctx)
    })
  ]
})

type PaneMeta = {
  expanded: boolean;
}
const $paneMeta = atom<PaneMeta>({ expanded: false }).pipe(
  withLocalStorage("paneMeta"),
  withAssign(() => ({
    update: action((ctx, newState: Partial<PaneMeta>) => {
      $paneMeta(ctx, s => ({ ...s, ...newState }));
    })
  }))
)

const memoryStats = {
  usedHeapMB: 0
}

// todo: add to the global pane bindings
function startOtherBinds(folder: FolderApi) {
  const otherFolder = folder.addFolder({ title: "other", expanded: false });

  try {
    memoryStats.usedHeapMB = getHeapSizeMB()

    const memoryMonitor = otherFolder.addBinding(memoryStats, 'usedHeapMB', {
      readonly: true,
      view: 'graph',
      min: 0,
      max: 100,
      label: 'JSHeap (MB)',
    })

    const intervalId = setInterval(() => {
      memoryStats.usedHeapMB = getHeapSizeMB();
      memoryMonitor.refresh();
    }, 500)

    subs.set("memoryHeap", () => clearInterval(intervalId))
  } catch (e) {
    if (isError(e)) {
      console.warn(e.message)
    }
  }
}

export const $pane = atom(null, "pane").pipe(
  withAssign((_, name) => ({
    getOrCreatePane: (): Pane => {
      if (instance) return instance;
      instance = new Pane();
      return instance;
    },
    init: action((ctx) => {
      const instance = $pane.getOrCreatePane();

      rootFolder = instance.addFolder({
        title: "dev",
        expanded: ctx.get($paneMeta).expanded
      });

      instance.element.style.zIndex = "1000";
      instance.element.style.position = "fixed";
      instance.element.style.right = "4px";
      instance.element.style.top = "4px";
      instance.element.style.overflow = "auto"
      instance.element.style.maxWidth = window.innerWidth * 0.7 + "px";

      function startBindNodes(folder: FolderApi) {
        folder.on("fold", (e) => {
          $paneMeta(ctx, { expanded: e.expanded });
        })

        for (const [scope, node] of Object.entries(BINDINGS)) {
          renderBindingNode(ctx, folder, node, scope);
        }
      }

      try {
        startBindNodes(rootFolder);
        startOtherBinds(rootFolder);
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
    dispose: action(() => {
      if (!instance) {
        console.warn("Pane is not defined");
        return;
      }

      instance.dispose();
      instance = null;
      rootFolder = null;

      subs.clear();
    }, `${name}.dispose`)
  }))
)

expose(function togglePane() {
  $devPaneIsEnabled(getReatomCtx(), s => !s)
})
