import {
  action, atom, reatomMap, withReset,
  type Atom, type Ctx, type Unsubscribe
} from "@reatom/framework";

let watcherId = 0;

type Watcher<T> = {
  id: string;
  triggerValue: Atom<T>;
  condition: (value: T) => boolean;
  handler: (ctx: Ctx, value: T) => void | Promise<void>;
};

const always = () => true;

const watch = <T>(
  triggerValue: Atom<T>,
  options: {
    condition?: (value: T) => boolean;
    handler: (ctx: Ctx, value: T) => void | Promise<void>;
  },
): Watcher<T> => ({
  id: `watcher_${watcherId++}`,
  triggerValue,
  condition: options.condition ?? always,
  handler: options.handler,
});

const getModelName = (p: string, c: string) => `${p}.watchers.${c}`;

const createWatcherModel = ({
  name, watchers: init
}: {
  name: string, watchers: Watcher<any>[]
}) => {
  const $watchers = atom(init, getModelName(name, "watchers")).pipe(
    withReset(),
  );

  const $watchersSubs = reatomMap<string, Unsubscribe>(
    new Map(), getModelName(name, "watchersSubs"),
  ).pipe(
    withReset(),
  );

  const define = action((ctx) => {
    const watchers = ctx.get($watchers);

    for (const watcher of watchers) {
      const { id, triggerValue, condition, handler } = watcher;

      let isFirst = true;

      const rawUnsub = ctx.subscribe(triggerValue, (value) => {
        if (isFirst) {
          isFirst = false;
          return;
        }

        if (condition(value)) {
          void handler(ctx, value);
        }
      });

      let disposed = false;

      const unsub: Unsubscribe = () => {
        if (disposed) return;
        disposed = true;

        rawUnsub();

        $watchersSubs.delete(ctx, id);
        $watchers(ctx, (state) => state.filter((w) => w.id !== id));
      };

      $watchersSubs.set(ctx, id, unsub);
    }
  }, getModelName(name, "define"))

  const clear = action((ctx) => {
    for (const [, unsub] of ctx.get($watchersSubs)) {
      unsub();
    }

    $watchersSubs.reset(ctx);
    $watchers.reset(ctx);
  }, getModelName(name, "clear"))

  const unsub = action((ctx, id: string) => {
    ctx.get($watchersSubs)?.get(id)?.();
  }, getModelName(name, "unsub"))

  return {
    define,
    clear,
    unsub,
    $watchersSubs,
    $watchers,
  }
}

export {
  watch,
  createWatcherModel,
  type Watcher
}
