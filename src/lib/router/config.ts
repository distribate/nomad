import { getConfigVal } from "../../const/config";
import { INITIAL_CONFIG_KEYS } from "../dev/const";

export class RedirectError extends Error {
  readonly to: string;
  readonly replace: boolean;

  constructor(to: string, replace = false) {
    super(`Redirecting to ${to}`);
    this.name = "RedirectError";
    this.to = to;
    this.replace = replace;
  }
}

export const routerNameRule = getConfigVal(INITIAL_CONFIG_KEYS.LOG_ROUTER);
