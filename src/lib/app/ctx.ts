import { createCtx as createReatomCtx } from "@reatom/framework";

function createCtx() {
  const ctx = createReatomCtx();
  return ctx;
}

const ctx = createCtx();

/*
  Return the root reatom context
*/
export const getReatomCtx = () => ctx
