import { atom }  from "@reatom/framework";
import { expose } from "../lib/utils"
import { withLocalStorage } from "@reatom/persist-web-storage";
import { getReatomCtx } from "../lib/app/ctx";

const defineValWithLS = (defaultVal: boolean, name: string) => atom(defaultVal, name).pipe(
  withLocalStorage(name)
)

export const $devPaneIsEnabled = defineValWithLS(import.meta.env.DEV, "devPane")

const config = {
  withGsap: defineValWithLS(true, "withGsap"),
  withAppActionsLog: defineValWithLS(true, "withAppActionsLog"),
  withAppRouterLog: defineValWithLS(true, "withAppRouterLog")
}

export const getConfigVal = (k: keyof typeof config) =>
  getReatomCtx().get(config[k]);
export const getConfig = () => config;

expose(function getAppConfig() {
  let b: Record<string, boolean> = {}
  for (const [k, v] of Object.entries(config)) {
    b[k] = getReatomCtx().get(v)
  }
  return b;
})
