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
    label: "Feed",
    target: "/",
  },
  {
    origin: "contacts",
    label: "Contacts",
    target: "/contacts",
    disabled: true,
  },
  {
    origin: "settings",
    label: "Settings",
    target: "/settings",
  },
  {
    origin: "me",
    target: "/me",
    label: "Profile",
  },
]
