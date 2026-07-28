import { action } from "@reatom/framework";
import { withRule } from "../helpers";
import { config } from "../../const/config";

export const initAsTMA = action(async () => {
  const { backButton, init } = await import("@tma.js/sdk")
  init();
  backButton.mount();
  backButton.show();
},
  withRule("initAsTMA", config.withAppActionsLog)
)
