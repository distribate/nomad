import { atom, withAssign } from "@reatom/framework";
import type { Component } from "solid-js";

type AnyComponent = Component<any>;

export const $header = atom(null, "header").pipe(
  withAssign((_, name) => ({
    nodes: atom<Record<"l" | "c" | "r", AnyComponent | null>>({
      l: null,
      c: null,
      r: null,
    }, `${name}.nodes`)
  }))
)
