export const GSAP_PLUGIN_LOADERS = [
  () => import("gsap/Flip").then((m) => m.Flip),
  () => import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger),
  () => import("gsap/Draggable").then((m) => m.Draggable),
  () => import("gsap/TextPlugin").then((m) => m.TextPlugin),
  () => import("gsap/InertiaPlugin").then((m) => m.InertiaPlugin),
];
