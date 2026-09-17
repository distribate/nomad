import { action, atom, withAssign, withReset } from "@reatom/framework";

const init = { l: null, c: null, r: null };

type HeaderNodes = Record<"l" | "c" | "r", AnyComponent | null>;

export const $header = atom(null, "header").pipe(
  withAssign((_, name) => ({
    nodes: atom<Record<"l" | "c" | "r", AnyComponent | null>>(init, `${name}.nodes`).pipe(
      withReset()
    ),
    snapshot: atom<HeaderNodes | null>(null, `${name}.snapshot`).pipe(
      withReset()
    ),
    height: atom<number>(0, `${name}.height`).pipe(withReset()),
    meta: atom<{ withBlur: boolean }>({ withBlur: false }, `${name}.meta`).pipe(withReset())
  }))
)

export const $headerNodes = {
  revert: action((ctx) => {
    const snapshot = ctx.get($header.snapshot);

    if (snapshot) {
      $header.nodes(ctx, snapshot)
    }

    $header.snapshot.reset(ctx)
  }, "revertHeaderNodes"),
  /**
    @params
    withSnapshot - whether to save the current state to the snapshot before updating
  */
  update: action((
    ctx, data: Partial<HeaderNodes>,
    params: { withSnapshot?: boolean, withBlur?: boolean } = { withSnapshot: true }
  ) => {
    const curr = ctx.get($header.nodes);

    if (params.withSnapshot) {
      $header.snapshot(ctx, curr);
    }

    if (params.withBlur !== undefined) {
      $header.meta(ctx, { withBlur: params.withBlur });
    }

    $header.nodes(ctx, (state) => ({ ...state, ...data }));
  }, "updateHeaderNodes")
}
