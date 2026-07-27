import { createCtx as createReatomCtx } from "@reatom/framework";

function createCtx() {
  const ctx = createReatomCtx();
  console.log("reatom ctx created")
  return ctx;
}

const ctx = createCtx();
export const getReatomCtx = () => ctx
