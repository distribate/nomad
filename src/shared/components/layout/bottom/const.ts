import { translate } from "../../../../lib/app/locale"

const BADGES_KEYS = ["feed", "contacts", "settings", "me"]

export type Badge = {
  origin: typeof BADGES_KEYS[number]
  label: string,
  disabled?: boolean,
  target: string,
}

export const BADGES: Badge[] = [
  {
    origin: "feed",
    label: translate["shared.feed"](),
    target: "/",
  },
  {
    origin: "contacts",
    label: translate["shared.contacts"](),
    target: "/contacts",
    disabled: true,
  },
  {
    origin: "settings",
    label: translate["shared.settings"](),
    target: "/settings",
  },
  {
    origin: "me",
    target: "/me",
    label: translate["shared.profile"](),
  },
]
