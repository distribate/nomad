import type { Ctx } from "@reatom/framework"
import { onCleanup, onMount } from "solid-js"

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
  options: { persistent?: boolean } = {}
) {
  if (!import.meta.env.DEV) return;

  onMount(() => {
    let devMod: DevModuleShape | null = null;
    let isMounted = true;

    loader().then((mod) => {
      if (!isMounted && !options.persistent) return;

      devMod = getDevModule(mod);
      devMod.mount(ctx);
    });

    onCleanup(() => {
      isMounted = false;

      if (!options.persistent) {
        devMod?.cleanup(ctx);
      }
    });
  });
}
