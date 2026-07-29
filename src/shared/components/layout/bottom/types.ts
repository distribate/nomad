import type { Atom } from "@reatom/framework";
import type { IconName } from "../../../ui/icon";

export type BadgeBase =
  | { as: "icon", icon: IconName }
  | { as: "img", value: { src: Atom<string | null>, fallback: Atom<string> } }
