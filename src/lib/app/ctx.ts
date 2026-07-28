import { createCtx as createReatomCtx } from "@reatom/framework";

function createCtx() {
  const ctx = createReatomCtx();
  return ctx;
}

const ctx = createCtx();
export const getReatomCtx = () => ctx
