import { action, reatomAsync, sleep } from "@reatom/framework";
import { rootLogger } from "../logger/logger.model.ts";
import { isError } from "../utils.ts";
import { modules } from "./modules.ts";
import { $appLoading } from "./app.model.ts";

const APP_LOADING_DELAY = 400;

export const beforeBoot = action(async (ctx) => {

}, "beforeBoot")

export const boot = reatomAsync(async (ctx) => {
  const ordered = [...modules].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
  );

  $appLoading(ctx, true);
  await sleep(APP_LOADING_DELAY);

  for (const module of ordered) {
    if (!module.condition?.() && module.condition !== undefined) {
      continue;
    }

    try {
      await module.init(ctx);
      rootLogger.info(`Module "${module.name}" booted successfully`);
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
}, "boot")
