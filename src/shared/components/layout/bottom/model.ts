import { atom, type Action, type Ctx } from "@reatom/framework"
import { navigate } from "../../../../lib/router/utils"
import { urlAtom } from "@reatom/url"

const BADGES_KEYS = [
  "feed", "contacts", "settings", "me"
]

export type Badge = {
  origin: typeof BADGES_KEYS[number]
  label: string,
  disabled?: boolean
} & ({
  type: "link"
  target: string
} | {
  type: "action"
  target: Action<[], void>
})

export const BADGES: Badge[] = [
  {
    origin: "feed",
    label: "Feed",
    type: "link",
    target: "/",
  },
  {
    origin: "contacts",
    label: "Contacts",
    type: "link",
    target: "/contacts",
    disabled: true,
  },
  {
    origin: "settings",
    label: "Settings",
    type: "link",
    target: "/settings",
  },
  {
    origin: "me",
    type: "link",
    target: "/me",
    label: "Profile",
  },
]

export const $badgeData = (target: string) => atom((ctx): { isActive: boolean } => {
  const badge = BADGES.find((badge) => badge.origin === target)

  if (!badge) {
    return { isActive: false }
  }

  return {
    isActive: badge.type === 'link' ? badge.target === ctx.spy(urlAtom).pathname : false,
  }
})

export const handleBadgeEvent = (ctx: Ctx, badge: Badge) => {
  switch (badge.type) {
    case "link":
      navigate(badge.target as string);
      break;
    case "action":
      badge.target(ctx);
      break;
  }
}
