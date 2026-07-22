import { action, atom, reatomAsync, withAssign, withErrorAtom, withStatusesAtom, type Ctx, type CtxSpy } from "@reatom/framework";
import { BackButton } from "../../ui/back-button";
import { $header } from "../layout/header/model";

type StateVariant = {
  cb?: (ctx: Ctx) => Promise<void> | void,
  cd?: (ctx: CtxSpy) => boolean
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
      cd: (ctx) => {
        return !!ctx.spy($introduction.firstName)
      }
    },
    meta: {
      name: "welcoming"
    }
  },
  3: {
    confirm: {
      cd: (ctx) => {
        return ctx.spy($introduction.interests).length >= 2
      }
    },
    meta: {
      name: "interests"
    }
  },
  4: {
    meta: {
      name: "style"
    }
  },
  5: {
    meta: {
      name: "in-searching"
    }
  },
  6: {
    confirm: {
      cb: (ctx) => {
        $introduction.data(ctx, (state) => ({
          ...state ?? {} as IntroductionData,
          location: {
            latitude: 2,
            longitude: 3,
          }
        }))
      }
    },
    meta: {
      name: "location"
    }
  },
  7: {
    meta: {
      name: "summary"
    }
  }
}
const wrapCb = reatomAsync(async (ctx, { cb }: { cb?: StateVariant["cb"] }) => {
  return await cb?.(ctx)
}, `wrapCb`).pipe(
  withStatusesAtom(),
  withErrorAtom()
)

// User data (pseudo)
//
// username (initially random hash string) (editable)
// createdAt (automatically set to current date)
// firstName - required, from user (editable)
// interests - required, from user (editable)
// style - required, from user (editable)
// location - optional, from user (editable)

type IntroductionData = {
  firstName: string,
  interests: string[],
  style: "calm" | "extrim" | "active",
  location?: {
    latitude: number,
    longitude: number,
  }
}

export const $introduction = atom(null, "introduction").pipe(
  withAssign((_, name) => ({
    idx: atom(0, `${name}.idx`),
    next: action(async (ctx) => {
      let currIdx = ctx.get($introduction.idx)

      const target = STAGES[currIdx];
      if (!target) throw new Error();

      await wrapCb(ctx, { cb: target.confirm?.cb });

      $introduction.idx(ctx, ++currIdx);
    }),
    back: action(async (ctx) => {
      let currIdx = ctx.get($introduction.idx)

      $introduction.idx(ctx, --currIdx);
    }),
    bbRef: atom<HTMLButtonElement | null>(null, `${name}.bbRef`),
    data: atom<IntroductionData | null>(null, `${name}.data`),
    //
    firstName: atom<string>("", `${name}.firstName`),
    interests: atom<string[]>([], `${name}.interests`),
    style: atom<"calm" | "extrim" | "active" | null>(null, `${name}.style`),
    location: atom<IntroductionData["location"] | null>(null, `${name}.location`),
  }))
)

export const $isNext = atom((ctx) => {
  const currIdx = ctx.spy($introduction.idx)
  if (currIdx === Object.keys(STAGES).length - 1) return false;

  const target = STAGES[currIdx]
  if (!target) {
    throw new Error(`No stage found for index ${currIdx}`)
  }

  const cd = target.confirm?.cd
  if (cd === undefined) return true;

  return cd(ctx)
}, `isNext`);

export const $isBack = atom((ctx) => {
  const currIdx = ctx.spy($introduction.idx)
  if (currIdx === 0) return false;

  const target = STAGES[currIdx]
  if (!target) {
    throw new Error(`No stage found for index ${currIdx}`)
  }

  const cd = target.back?.cd;
  if (cd === undefined) return true;

  return cd(ctx)
}, "isBack");

wrapCb.statusesAtom.onChange((ctx, state) => {
  const isDisabled = state.isPending || state.isRejected

  const ref = ctx.get($introduction.bbRef)
  if (!ref) return;

  ref.disabled = isDisabled
})

$isBack.onChange((ctx, state) => {
  if (state) {
    $header.nodes.set(
      ctx,
      "l",
      () => BackButton({
        onClick: () => {
          $introduction.back(ctx)
        },
        ref: (el) => {
          $introduction.bbRef(ctx, el)
        }
      }),
    )
  } else {
    $header.nodes.set(ctx, "l", null)
  }
})
