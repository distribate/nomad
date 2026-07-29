import { action, atom, reatomMap, withAssign, withReset, type Ctx } from "@reatom/framework"
import { navigate } from "../../../../lib/router/utils"
import { urlAtom } from "@reatom/url"
import { $isAuthed, $user } from "../../../../lib/user/user.model"
import { BADGES, type Badge } from "./const"

export const $badgeIsActive = (target: string) => atom((ctx): boolean => {
  const badge = BADGES.find((badge) => badge.origin === target)
  if (!badge) return false

  return badge.target === ctx.spy(urlAtom).pathname
})

type TypedPointerEvent<T extends Element> = PointerEvent & {
  currentTarget: T
}

const MOVE_DELAY = 250

export const $badge = atom(null, "badge").pipe(
  withAssign((_, name) => ({
    activeBadge: atom<Badge | null>(null, `${name}.activeBadge`).pipe(withReset()),
    execEvent: action((_, b: Badge) => {
      navigate(b.target)
    }),
    startMove: action((ctx, badge: Badge, e: TypedPointerEvent<HTMLButtonElement>) => {
      const timer = setTimeout(() => {
        const rect = e.currentTarget.getBoundingClientRect()

        $badge.activeBadge(ctx, badge)
      }, MOVE_DELAY)
    }),
    inMove: action((ctx, e: PointerEvent) => {

    }),
    stopMove: action((ctx) => {
      const badge = ctx.get($badge.activeBadge)

      $badge.activeBadge(ctx, null)
    }),
  }))
)

export const $bottom = atom(null, "bottom").pipe(
  withAssign((_, name) => ({
    isEnabled: atom((ctx) => ctx.spy($isAuthed)),
    barRef: atom<HTMLDivElement | null>(null).pipe(withReset()),
    badgesRefs: reatomMap<string, HTMLButtonElement | null>(new Map()),
    height: atom(0, `${name}.height`),
  }))
)

export const getBottomBadge = (ctx: Ctx, o: string): HTMLButtonElement => {
  const target = $bottom.badgesRefs.get(ctx, o)
  if (!target) throw new Error(`Badge not found: ${o}`)
  return target
}

export const $userPhoto = atom((ctx) => ctx.spy($user.data)?.photo?.src ?? null)
export const $userFirstLetterInFirstName = atom((ctx) => ctx.spy($user.data)?.firstName?.[0] ?? "Me")
