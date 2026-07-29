import { action, atom } from "@reatom/framework";
import { getConfigVal } from "../../const/config";
import { createNoopProxy } from "../utils";
import { GSAP_PLUGIN_LOADERS } from "./plugins";
import { withRule } from "../helpers";
import { $settings } from "../../shared/components/settings/model";
import { getReatomCtx } from "../app/ctx";

export let gsapInstance: typeof import("gsap").default | null = null;

export let $gsapPlugins = atom<string[]>([]);

export const $gsapIsEnabled = atom((ctx) => {
  const fromSettings = ctx.spy($settings.preferences.animations);
  const fromConfig = getConfigVal("withGsap");
  return fromSettings && fromConfig;
})

export const initGsap = action(async (ctx) => {
  const enabled = ctx.get($gsapIsEnabled);

  if (!enabled) {
    return;
  }

  const [gsapModule, ...loadedPlugins] = await Promise.all([
    import("gsap"),
    ...GSAP_PLUGIN_LOADERS.map((loader) => loader()),
  ]);

  const gsap = gsapModule.default || gsapModule.gsap;

  gsap.registerPlugin(...loadedPlugins);
  $gsapPlugins(ctx, loadedPlugins.map(p => p.name))

  gsapInstance = gsap;
},withRule("initGsap", getConfigVal("withAppActionsLog")))

export const getGsap = (): typeof gsap => {
  const enabled = getReatomCtx().get($gsapIsEnabled)

  if (enabled) {
    if (gsapInstance) return gsapInstance;
    throw new Error("Gsap is not initialized");
  }

  return createNoopProxy()
}
