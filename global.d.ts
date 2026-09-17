import type { Component } from "solid-js";

declare global {
  type Awaitable<T> = T | Promise<T>;
  type AnyComponent = Component<any>
}

export {}
