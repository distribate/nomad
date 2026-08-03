import { type Action, type Atom, type AtomMut, type Ctx, type MapAtom } from "@reatom/framework";
import { useAtom } from "@reatom/npm-solid-js";
import { onCleanup } from "solid-js";
import { getConfigVal } from "../../const/config";
import { INITIAL_CONFIG_KEYS } from "../dev/const";

export const useAtomAccessor = <T,>(atom: Atom<T>) => useAtom(atom)[0]

type Target<T> =
  | MapAtom<any, T | null>
  | (AtomMut<T | null> & { reset: Action<[], T | null> }); // AtomMut require the reset action

export const defineRefAtom = <T extends HTMLElement>(
  ctx: Ctx, key: string, $target: Target<T>
) => {
  const withLog = getConfigVal(INITIAL_CONFIG_KEYS.LOG_REF_ATOM);

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
