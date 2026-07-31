import { type Action, type Atom, type AtomMut, type Ctx, type MapAtom } from "@reatom/framework";
import { useAtom } from "@reatom/npm-solid-js";
import { onCleanup } from "solid-js";

export const useAtomAccessor = <T,>(atom: Atom<T>) => useAtom(atom)[0]

type Target<T> =
  | MapAtom<any, T | null>
  // AtomMut require the reset action
  | (AtomMut<T | null> & { reset: Action<[], T | null> });

export const defineRefAtom = <T extends HTMLElement>(
  ctx: Ctx,
  key: string,
  $target: Target<T>,
  params?: {
    withLog?: boolean
  }
) => {
  const { withLog } = params ?? {
    withLog: import.meta.env.DEV
  };

  return (el: T | null) => {
    const cleanup = "getOrCreate" in $target
      ? () => $target.delete(ctx, key)
      : () => $target.reset(ctx);

    let node: T | null = null;

    if ("getOrCreate" in $target) {
      node = $target.getOrCreate(ctx, key, () => el);
    } else {
      node = $target(ctx, el);
    }

    if (withLog) {
      console.log("+ ref atom", { k: key, n: node });
    }

    onCleanup(() => {
      cleanup();

      if (withLog) {
        console.log("- ref atom", { k: key });
      }
    });
  };
};
