import { type Action, type Atom, type AtomMut, type Ctx, type MapAtom } from "@reatom/framework";
import { useAtom } from "@reatom/npm-solid-js";
import { onCleanup } from "solid-js";
import { getConfigVal } from "../../const/config";
import { STATIC_CONFIG_KEYS } from "../dev/const";

export const useAtomAccessor = <T,>(atom: Atom<T>) => useAtom(atom)[0]

type Target<T> =
  | MapAtom<any, T | null>
  | (AtomMut<T | null> & { reset: Action<[], T | null> }); // AtomMut require the reset action

export const defineRefAtom = <T extends HTMLElement>(
  ctx: Ctx, key: string, $target: Target<T>, prefix?: string
) => {
  const withLog = getConfigVal(STATIC_CONFIG_KEYS.LOG_REF_ATOM);
  const logKey = prefix ? `${prefix}.${key}` : key;

  return (el: T | null) => {
    if (el) {
      if ("set" in $target) {
        $target.set(ctx, key, el);
      } else {
        $target(ctx, el);
      }

      if (withLog) {
        console.log("[+] Ref atom", { k: logKey });
      }
    }

    onCleanup(() => {
      if ("delete" in $target) {
        $target.delete(ctx, key);
      } else {
        $target.reset(ctx);
      }

      if (withLog) {
        console.log("[-] Ref atom", { k: logKey });
      }
    });
  };
};
