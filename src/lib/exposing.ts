import { exposePublic } from "./utils"
import { getAppConfig } from "./app/config"

export function registerPublicApi() {
  exposePublic(getAppConfig, "getAppConfig");
}
