import { exposePublic } from "../../lib/utils"
import { getAppConfig } from "../../lib/app/config"

export function registerPublicApi() {
  exposePublic(getAppConfig, "getAppConfig");
  import.meta.env.DEV && console.log("api registered");
}
