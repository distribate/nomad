import { translate } from "i18n"

const BADGES_KEYS = ["feed", "friends", "settings", "me"] as const;

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
    origin: "friends",
    label: translate["shared.friends"](),
    target: "/friends",
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
