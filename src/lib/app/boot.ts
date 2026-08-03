import { action, atom, reatomAsync, sleep } from "@reatom/framework";
import { rootLogger } from "../logger/logger.model.ts";
import { isError } from "../utils.ts";
import { modules } from "./modules.ts";
import { $appLoading } from "./app.model.ts";
import { getConfigVal } from "../../const/config.ts";
import { STATIC_CONFIG_KEYS } from "../dev/const.ts";
import { withRule } from "../helpers/index.ts";
import type { AppModule } from "./types.ts";

const APP_LOADING_DELAY = 400;

export const $modules = atom<Array<Pick<AppModule, "name"> & { duration: number, elapsed: number }>>([])

export const beforeBoot = action(async (ctx) => {

}, withRule("beforeBoot", getConfigVal(STATIC_CONFIG_KEYS.LOG_APP_ACTIONS)))

const round = (n: number) => Math.round(n * 100) / 100;

export const boot = reatomAsync(async (ctx) => {
  const ordered = [...modules].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
  );

  $appLoading(ctx, true);
  await sleep(APP_LOADING_DELAY);

  const bootStarted = performance.now();

  for (const module of ordered) {
    if (!module.when?.() && module.when !== undefined) {
      continue;
    }

    const moduleStarted = performance.now();

    try {
      await module.init(ctx);

      $modules(ctx, state => [
        ...state,
        {
          name: module.name,
          duration: round(performance.now() - moduleStarted),
          elapsed: round(performance.now() - bootStarted),
        },
      ]);
    } catch (e) {
      rootLogger.error(
        `Failed to boot module "${module.name}" with "${isError(e) ? e.message : "unknown error"}"`,
      );

      if (module.critical ?? true) {
        throw e;
      }
    }
  }

  $appLoading(ctx, false);
}, withRule("boot", getConfigVal(STATIC_CONFIG_KEYS.LOG_APP_ACTIONS)))
