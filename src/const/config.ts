import { expose } from "../lib/utils"

export const config = {
  withDev: false,
  withGsap: true,
  withAppActionsLog: true,
  withAppRouterLog: true
}

if (import.meta.env.DEV) {
  expose(function getAppConfig() {
    return config
  })
}
