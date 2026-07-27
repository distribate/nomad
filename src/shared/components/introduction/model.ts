import {
  action, atom, reatomAsync, withAssign, withErrorAtom, withReset, withStatusesAtom,
  type Ctx, type CtxSpy
} from "@reatom/framework";
import { BackButton } from "../../ui/back-button";
import { $header } from "../layout/header/model";
import { $user, type User } from "../../../lib/user/user.model";
import { compareAtom } from "../../../lib/utils";
import { nanoid } from "nanoid";
import { $appState } from "../../../lib/app/app.model";
import type { UserLocation, UserPhoto, UserStyle } from "../../../lib/user/types";
import { navigate } from "../../../router";

type StateVariant = {
  callback?: (ctx: Ctx) => Promise<void> | void,
  condition?: (ctx: CtxSpy) => boolean,
}

type Stage = {
  confirm?: StateVariant,
  back?: StateVariant,
  meta: {
    name: string,
    description?: string
  }
}

const STAGES: Record<number, Stage> = {
  0: {
    meta: {
      name: "splash",
    }
  },
  1: {
    meta: {
      name: "value-proposition",
    }
  },
  2: {
    confirm: {
      condition: (ctx) => {
        const target = ctx.spy($introduction.firstName)
        if (!target.trim()) return false

        if (target.length < 1 || target.length > 26) return false

        return true
      },
    },
    meta: {
      name: "welcoming"
    }
  },
  3: {
    confirm: {
      condition: (ctx) => ctx.spy($introduction.interests).length >= 2 &&
        ctx.spy($introduction.interests).length >= 3
    },
    meta: {
      name: "interests"
    }
  },
  4: {
    confirm: {
      condition: (ctx) => !!ctx.spy($introduction.style)
    },
    meta: {
      name: "style"
    }
  },
  5: {
    confirm: {
      condition: (ctx) => !!ctx.spy($introduction.goal)
    },
    meta: {
      name: "goals"
    }
  },
  6: {
    confirm: {
      callback: (ctx) => {
        $introduction.summary(ctx, ({
          firstName: ctx.get($introduction.firstName),
          interests: ctx.get($introduction.interests),
          style: ctx.get($introduction.style) ?? "calm",
          goal: ctx.get($introduction.goal) ?? "",
          location: ctx.get($introduction.location)
        }))
      }
    },
    meta: {
      name: "location"
    }
  },
  7: {
    confirm: {
      condition: (ctx) => {
        return !!ctx.spy($introduction.summary)
      },
      callback: (ctx) => {
        const summary = ctx.get($introduction.summary) as SummaryData;

        $user.data(ctx, {
          firstName: summary.firstName,
          createdAt: new Date().toISOString(),
          username: nanoid(8),
          photo: {
            src: "test"
          }
        })

        navigate(ctx, "/")
      }
    },
    meta: {
      name: "summary"
    }
  }
}
const wrapCb = reatomAsync(async (ctx, { cb }: { cb?: StateVariant["callback"] }) => {
  return await cb?.(ctx)
}, `wrapCb`).pipe(
  withStatusesAtom(),
  withErrorAtom()
)
const STAGES_CONFIRM_LABELS: Record<number, Map<(ctx: CtxSpy) => boolean, string>> = {
  6: new Map([
    [(ctx) => !ctx.spy($introduction.location), "Продолжить без локации"],
    [(ctx) => !!ctx.spy($introduction.location), "Продолжить"],
  ]),
  7: new Map([
    [(ctx) => true, "Завершить"],
  ]),
}

type SummaryData = Pick<User, "firstName"> & {
  // required, from user (editable)
  interests: string[],
  // required, from user (editable)
  style: UserStyle,
  // optional, from user (editable)
  location: UserLocation | null,
  goal: string,
  photo?: UserPhoto
}

export const $introduction = atom(null, "introduction").pipe(
  withAssign((_, name) => ({
    idx: atom(0, `${name}.idx`),
    next: action(async (ctx) => {
      let currIdx = ctx.get($introduction.idx)
      console.log(currIdx);
      const target = getTarget(currIdx)

      await wrapCb(ctx, { cb: target.confirm?.callback });

      if (currIdx < Object.keys(STAGES).length - 1) {
        $introduction.idx(ctx, ++currIdx);
      }
    }),
    back: action(async (ctx) => {
      let currIdx = ctx.get($introduction.idx)

      $introduction.idx(ctx, --currIdx);
    }),
    backButtonRef: atom<HTMLButtonElement | null>(null, `${name}.backButtonRef`).pipe(withReset()),
    confirmBtnRef: atom<HTMLButtonElement | null>(null, `${name}.confirmBtnRef`).pipe(withReset()),
    summary: atom<SummaryData | null>(null, `${name}.data`),
    //
    firstName: atom<string>("", `${name}.firstName`),
    interests: atom<string[]>([], `${name}.interests`),
    style: atom<UserStyle | null>(null, `${name}.style`),
    goal: atom<string | null>(null, `${name}.goal`),
    location: atom<SummaryData["location"] | null>(null, `${name}.location`),
  }))
)

const getTarget = (idx: number) => {
  const target = STAGES[idx]
  if (!target) throw new Error(`No stage found for index ${idx}`)
  return target
}

// atom that determines if the next stage is valid based on the current stage's condition
// by default if value is false, the confirm button is hidden
export const $isNext = atom((ctx) => {
  const currIdx = ctx.spy($introduction.idx)
  if (currIdx === Object.keys(STAGES).length) return false;
  return true;
}, `isNext`);

export const $isValid = atom((ctx) => {
  const currIdx = ctx.spy($introduction.idx)
  const target = getTarget(currIdx);

  const cd = target.confirm?.condition;
  if (!cd) return true;

  return cd(ctx)
}, "isValid")

export const $isBack = atom((ctx) => {
  const currIdx = ctx.spy($introduction.idx)
  if (currIdx === 0) return false;

  const target = getTarget(currIdx);

  const cd = target.back?.condition;
  if (cd === undefined) return true;

  return cd(ctx)
}, "isBack");

wrapCb.statusesAtom.onChange((ctx, state) => {
  const isDisabled = state.isPending || state.isRejected

  const ref = ctx.get($introduction.backButtonRef)
  if (!ref) return;

  ref.disabled = isDisabled
})

$isBack.onChange((ctx, state) => {
  if (state) {
    $header.nodes(
      ctx,
      (state) => ({
        ...state, l: () => BackButton({
          onClick: () => {
            $introduction.back(ctx)
          },
          ref: (el) => {
            $introduction.backButtonRef(ctx, el)
          }
        })
      })
    )
  } else {
    $header.nodes(ctx, (state) => ({ ...state, l: null }))
  }
})

export const $confirmLabel = atom<string | null>((ctx) => {
  const cd = STAGES_CONFIRM_LABELS[ctx.spy($introduction.idx)]
  if (!cd) return null;

  for (const [condition, label] of cd.entries()) {
    if (condition(ctx)) {
      return label
    }
  }

  return null;
})

export const $hasInterest = (target: string) => compareAtom($introduction.interests, (curr) => curr.includes(target))
export const $isGoal = (target: string) => compareAtom($introduction.goal, (curr) => curr === target)
export const $isStyle = (target: string) => compareAtom($introduction.style, (curr) => curr === target)

if (import.meta.env.DEV) {
  $isNext.onChange((_, s) => console.log($isNext.__reatom.name, s));
  $isBack.onChange((_, s) => console.log($isBack.__reatom.name, s));
  $isValid.onChange((_, s) => console.log($isValid.__reatom.name, s));
}
