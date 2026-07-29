import { action } from "@reatom/framework";
import { rootLogger } from "../logger/logger.model.ts";
import { isError } from "../utils.ts";
import { modules } from "./modules.ts";

export const boot = action(async (ctx) => {
  const ordered = [...modules].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
  );

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
}, "boot");
