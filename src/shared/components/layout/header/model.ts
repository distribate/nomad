import { action, atom, withAssign, withReset } from "@reatom/framework";
import type { Component } from "solid-js";

type AnyComponent = Component<any>;

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
  }))
)

export const updateHeaderNodes = action((ctx, data: Partial<HeaderNodes>, params: { withSnapshot: boolean } = { withSnapshot: true }) => {
  const curr = ctx.get($header.nodes);

  if (params.withSnapshot) {
    $header.snapshot(ctx, curr);
  }

  $header.nodes(ctx, (state) => ({ ...state, ...data }));
}, "updateHeaderNodes")

export const revertHeaderNodes = action((ctx) => {
  const snapshot = ctx.get($header.snapshot);

  if (snapshot) {
    $header.nodes(ctx, snapshot)
  }

  $header.snapshot.reset(ctx)
}, "revertHeaderNodes")
