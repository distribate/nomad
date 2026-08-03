import { action } from "@reatom/framework";
import { withRule } from "../helpers";
import { getConfigVal } from "../../const/config";
import { STATIC_CONFIG_KEYS } from "../dev/const";

export const initAsTMA = action(async () => {
  const { backButton, init } = await import("@tma.js/sdk")
  init();
  backButton.mount();
  backButton.show();
}, withRule("initAsTMA", getConfigVal(STATIC_CONFIG_KEYS.LOG_APP_ACTIONS)))
