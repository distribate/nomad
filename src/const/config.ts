import { atom }  from "@reatom/framework";
import { expose } from "../lib/utils"
import { withLocalStorage } from "@reatom/persist-web-storage";
import { getReatomCtx } from "../lib/app/ctx";

export const DEV_PANE = true;

const config = {
  withGsap: atom(true, "withGsap").pipe(withLocalStorage("withGsap")),
  withAppActionsLog: atom(true, "withAppActionsLog").pipe(withLocalStorage("withAppActionsLog")),
  withAppRouterLog: atom(true, "withAppRouterLog").pipe(withLocalStorage("withAppRouterLog"))
}

export const getConfigVal = (k: keyof typeof config) => getReatomCtx().get(config[k])
export const getConfig = () => config;

if (import.meta.env.DEV) {
  expose(function getAppConfig() {
    let b: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(config)) {
      b[k] = getReatomCtx().get(v)
    }
    return b;
  })
}
