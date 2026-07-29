import { action, atom, type Atom, type Ctx, type Unsubscribe } from "@reatom/framework";

export type Watcher<T> = {
  triggerValue: Atom<T>;
  condition: (value: T) => boolean;
  handler: (ctx: Ctx, value: T) => void | Promise<void>;
};

const always = () => true;

export const watch = <T>(
  triggerValue: Atom<T>,
  options: {
    condition?: (value: T) => boolean;
    handler: (ctx: Ctx, value: T) => void | Promise<void>;
  },
): Watcher<T> => ({
  triggerValue,
  condition: options.condition ?? always,
  handler: options.handler,
});

const getModelName = (p: string, c: string) => `${p}.watchers.${c}`;

export const watchersModel = ({
  name, watchers
}: {
  name: string, watchers: Watcher<any>[]
}) => {
  const $watchersSubs = atom<Unsubscribe[]>([], getModelName(name, "watchersSubs"));

  const define = action((ctx) => {
    for (const { triggerValue, condition, handler } of watchers) {
      const unsub = ctx.subscribe(triggerValue, (value) => {
        if (condition(value)) {
          void handler(ctx, value);
        }
      });

      $watchersSubs(ctx, state => [...state, unsub]);
    }
  }, getModelName(name, "define"))

  return {
    define,
    $watchersSubs,
  }
}
