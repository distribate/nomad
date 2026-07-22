import { atom, reatomMap, withAssign } from "@reatom/framework";
import type { Component } from "solid-js";

type AnyComponent = Component<any>;

export const $header = atom(null, "header").pipe(
  withAssign((_, name) => ({
    nodes: reatomMap<"l" | "r" | "c", AnyComponent | null>(new Map([["l", null], ["r", null], ["c", null]]), `${name}.node`)
  }))
)
