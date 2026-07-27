import { action, type Action, type Atom, type AtomMut, type Ctx, type MapAtom } from "@reatom/framework";
import { useAtom } from "@reatom/npm-solid-js";
import { onCleanup } from "solid-js";
import { rootLogger } from "./logger/logger.model";

export const useAtomAccessor = <T,>(atom: Atom<T>) => useAtom(atom)[0]

type Target<T> =
  | MapAtom<any, T | null>
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
      rootLogger.info({ msg: "Created ref atom", key, node });
    }

    onCleanup(() => {
      cleanup();

      if (withLog) {
        rootLogger.info({ msg: "Deleted ref atom", key });
      }
    });
  };
};

export const reatomRouteAction = <
  T extends { reatomCtx: Ctx },
>(
  cb: (ctx: Ctx, routeCtx: T, ...args: any[]) => any,
  name?: string,
) => {
  const target = action(
    (ctx, routeCtx: T, ...args: any[]) => {
      return cb(ctx, routeCtx, ...args)
    },
    `${name ?? "unknown"}.route`,
  )

  return ((routeCtx: T, ...args: any[]) => {
    return target(routeCtx.reatomCtx, routeCtx, ...args)
  }) as any
}
