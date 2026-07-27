import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { TextPlugin } from "gsap/TextPlugin";
import { InertiaPlugin } from "gsap/InertiaPlugin";

import { atom } from "@reatom/framework";
import { createNoopProxy } from "../utils";

import { config } from "../../const/config";

export const GSAP_PLUGINS = [
  Flip, ScrollTrigger,
  Draggable, TextPlugin, InertiaPlugin
];

export const $setupedPlugins = atom<string[]>(GSAP_PLUGINS.map(d => d.name), "setupedPlugins")

export const getGsap = (): typeof gsap => {
  if (config.withGsap) {
    return gsap;
  }

  return createNoopProxy()
}
