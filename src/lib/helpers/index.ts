import type { Ctx } from "@reatom/framework"
import { lazy, onCleanup, onMount, type Component } from "solid-js"

/**
 * Applies a rule to a given name, returning the name with or without a leading underscore.
 * In Reatom, anything with an underscore prefix is not logged.
 */
export const withRule = (name: string, rule: (() => boolean) | boolean): string => {
  return (typeof rule === "function" ? rule() : rule)
    ? name
    : `_${name}`
}

type ModelContext = {
  name: (childName: string) => string,
}

export function declareModel<T>(
  modelName: string,
  fn: (ctx: ModelContext) => T
): T {
  const name = (childName: string) => `${modelName}.${childName}`
  return fn({ name })
}

type DevModuleShape = {
  mount: (ctx: Ctx) => void;
  cleanup: (ctx: Ctx) => void;
}

export function setupDevModule<T>(
  ctx: Ctx,
  loader: () => Promise<T>,
  getDevModule: (mod: T) => DevModuleShape,
) {
  if (!import.meta.env.DEV) return;

  onMount(() => {
    let devMod: DevModuleShape | null = null;
    let isMounted = true;

    loader().then((mod) => {
      if (!isMounted) return;

      devMod = getDevModule(mod);
      devMod.mount(ctx);
    });

    onCleanup(() => {
      isMounted = false;
      devMod?.cleanup(ctx);
    });
  });
}

export function getHeapSizeMB(): number {
  const mem = (performance as any)?.memory;
  if (!mem) {
    throw new Error("performance.memory is not available");
  }
  return Number((mem.usedJSHeapSize / 1024 / 1024).toFixed(2));
}

export const lazyComponent =  <T extends Component>(
  loader: () => Promise<T>
) =>
  lazy(() =>
    loader().then(component => ({
      default: component,
    }))
  );
