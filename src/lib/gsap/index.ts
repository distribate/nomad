import { action, atom, withAssign } from "@reatom/framework";
import { getConfigVal } from "../../const/config";
import { createNoopProxy } from "../utils";
import { GSAP_PLUGIN_LOADERS } from "./plugins";
import { $settings } from "../../shared/components/settings/model";
import { getReatomCtx } from "../app/ctx";

type Gsap = typeof import("gsap").gsap;
let instance: Gsap | null = null;

export const $gsapPlugins = atom<string[]>([]);

export const $gsapIsEnabled = atom((ctx) => {
  const fromSettings = ctx.spy($settings.preferences.animations);

  // by default gsap devflag is enabled in prod instead of config val
  const fromConfig = import.meta.env.DEV
    ? getConfigVal("withGsap")
    : true;

  return fromSettings && fromConfig;
})

export const $gsap = atom(null, "gsap").pipe(
  withAssign((_, name) => ({
    init: action(async (ctx) => {
      const enabled = ctx.get($gsapIsEnabled);
      if (!enabled) return;

      const [gsapModule, ...loadedPlugins] = await Promise.all([
        import("gsap"),
        ...GSAP_PLUGIN_LOADERS.map((loader) => loader()),
      ]);

      const gsap = gsapModule.default || gsapModule.gsap;

      gsap.registerPlugin(...loadedPlugins);
      $gsapPlugins(ctx, loadedPlugins.map(p => p.name))

      instance = gsap;
    }, `${name}.init`)
  }))
)

export const getGsap = (): Gsap => {
  const enabled = getReatomCtx().get($gsapIsEnabled)
  if (!enabled) return createNoopProxy();

  if (instance) return instance;

  throw new Error("Gsap is not initialized");
}
