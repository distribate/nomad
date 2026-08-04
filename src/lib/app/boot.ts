import { action, atom, reatomAsync, sleep, type Ctx } from "@reatom/framework";
import { rootLogger } from "../logger/logger.model.ts";
import { isError } from "../utils.ts";
import { modules } from "./modules.ts";
import { $appLoading, $appState, $lang } from "./app.model.ts";
import { getConfigVal } from "../../const/config.ts";
import { STATIC_CONFIG_KEYS } from "../dev/const.ts";
import { withRule } from "../helpers/index.ts";
import { isTMA } from "@tma.js/sdk";
import { getLocale } from "../../paraglide/runtime.js";

const APP_LOADING_DELAY = 400;

type AppModuleStatus =
  | "pending"
  | "loading"
  | "loaded"
  | "skipped"
  | "failed";

type AppModuleRuntime = {
  name: string;
  status: AppModuleStatus;
  startedAt?: number;
  finishedAt?: number;
  duration?: number;
  error?: unknown;
  deps?: string[];
};

export const $modules = atom<Record<string, AppModuleRuntime>>({});

const updateModule = (
  ctx: Ctx,
  name: string,
  patch: Partial<AppModuleRuntime>
) => {
  $modules(ctx, state => ({
    ...state,
    [name]: {
      ...state[name],
      name,
      ...patch,
    },
  }));
};

export const beforeBoot = action(async (ctx) => {
  $appState.type(ctx, isTMA() ? "tma" : "standalone")
  $lang(ctx, getLocale())
}, withRule("beforeBoot", getConfigVal(STATIC_CONFIG_KEYS.LOG_APP_ACTIONS)))

const round = (n: number) => Math.round(n * 100) / 100;

export const boot = reatomAsync(async (ctx) => {
  const ordered = [...modules].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
  );

  $appLoading(ctx, true);
  await sleep(APP_LOADING_DELAY);

  for (const module of ordered) {
    const name = module.name;

    if (module.when && !module.when()) {
      updateModule(ctx, name, {
        status: "skipped",
      });

      continue;
    }

    const started = performance.now();

    updateModule(ctx, name, {
      status: "loading",
      startedAt: started,
    });

    try {
      await module.init(ctx);

      updateModule(ctx, name, {
        status: "loaded",
        finishedAt: performance.now(),
        duration: round(
          performance.now() - started
        ),
      });
    } catch (e) {
      updateModule(ctx, name, {
        status: "failed",
        error: e,
      });

      rootLogger.error(
        `Module ${name} failed with error ${isError(e) ? e.message : "unknown error"}`,
      );

      if (module.critical ?? true) {
        throw e;
      }
    }
  }

  $appLoading(ctx, false);
}, withRule("boot", getConfigVal(STATIC_CONFIG_KEYS.LOG_APP_ACTIONS)))
