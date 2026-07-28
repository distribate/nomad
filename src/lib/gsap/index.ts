import { action } from "@reatom/framework";
import { config } from "../../const/config";
import { createNoopProxy } from "../utils";
import { GSAP_PLUGIN_LOADERS } from "./plugins";
import { withRule } from "../helpers";

export let gsapInstance: typeof import("gsap").default | null = null;

export let $gsapPlugins: string[] = [];

export const initGsap = action(async (_) => {
  if (!config.withGsap) {
    console.log("gsap init skip")
    return;
  }

  const [gsapModule, ...loadedPlugins] = await Promise.all([
    import("gsap"),
    ...GSAP_PLUGIN_LOADERS.map((loader) => loader()),
  ]);

  const gsap = gsapModule.default || gsapModule.gsap;

  gsap.registerPlugin(...loadedPlugins);
  $gsapPlugins = loadedPlugins.map(p => p.name);

  gsapInstance = gsap;
  return gsapInstance;
},
  withRule("initGsap", config.withAppActionsLog)
)

export const getGsap = (): typeof gsap => {
  if (config.withGsap) {
    if (gsapInstance) return gsapInstance;
    throw new Error("Gsap is not initialized");
  }

  return createNoopProxy()
}
