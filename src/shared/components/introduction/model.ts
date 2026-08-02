import {
  action, atom, reatomAsync, reatomMap, withAssign, withErrorAtom, withReset, withStatusesAtom,
  type Ctx, type CtxSpy
} from "@reatom/framework";
import { BackButton } from "../../ui/back-button";
import { $header, $headerNodes } from "../layout/header/model";
import { $user, type User } from "../../../lib/user/user.model";
import { compareAtom } from "../../../lib/utils";
import { nanoid } from "nanoid";
import type { UserLocation, UserPhoto, UserStyle } from "../../../lib/user/types";
import { navigate } from "../../../lib/router/utils";
import { declareModel } from "../../../lib/helpers";
import { withLog } from "../../../lib/reatom/extensions";

type StageFlow = {
  callback?: (ctx: Ctx) => Promise<void> | void,
  when?: (ctx: CtxSpy) => boolean,
}

type Stage = {
  name: string,
  description?: string,
  confirm?: StageFlow,
  back?: StageFlow,
}

const stages: Record<number, Stage> = {
  0: {
    name: "splash",
  },
  1: {
    name: "value-proposition",
  },
  2: {
    confirm: {
      when: (ctx) => {
        const target = ctx.spy($intro.firstName)
        if (!target.trim()) return false

        if (target.length < 1 || target.length > 26) return false

        return true
      },
    },
    name: "welcoming"
  },
  3: {
    confirm: {
      when: (ctx) => ctx.spy($intro.interests).length >= 2 &&
        ctx.spy($intro.interests).length < 4
    },
    name: "interests"
  },
  4: {
    confirm: {
      when: (ctx) => !!ctx.spy($intro.style)
    },
    name: "style"
  },
  5: {
    confirm: {
      when: (ctx) => !!ctx.spy($intro.goal)
    },
    name: "goals"
  },
  6: {
    name: "location"
  },
  7: {
    confirm: {
      callback: async (ctx) => {
        $user.data(ctx, {
          firstName: ctx.get($intro.firstName),
          createdAt: new Date().toISOString(),
          username: nanoid(8),
          photo: {
            src: "test"
          }
        })

        $header.nodes.reset(ctx);

        $intro.idx.reset(ctx);
        $intro.resetTargetSummaryFields(ctx);
        $intro.refsMap.reset(ctx);

        await navigate("/")
      }
    },
    name: "summary"
  }
}

type ConditionLabel = {
  when: (ctx: CtxSpy) => boolean;
  label: () => string;
};

const STAGES_CONFIRM_LABELS: Record<number, ConditionLabel[]> = {
  6: [
    {
      when: (ctx) => !ctx.spy($intro.location),
      label: () => "Продолжить без локации",
    },
    {
      when: (ctx) => !!ctx.spy($intro.location),
      label: () => "Продолжить",
    },
  ],
  7: [
    {
      when: () => true,
      label: () => "Завершить",
    },
  ],
};

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

const $introModel = declareModel("intro", ({ name }) => {
  const wrapCb = reatomAsync(async (ctx, cb?: StageFlow["callback"]) => {
    return await cb?.(ctx)
  }, name(`wrapCb`)).pipe(
    withStatusesAtom(),
    withErrorAtom()
  )

  const $intro = atom(null, name(`intro`)).pipe(
    withAssign((_, name) => ({
      idx: atom(0, `${name}.idx`).pipe(withReset(), withLog()),
      next: action(async (ctx) => {
        let currIdx = ctx.get($intro.idx)
        const target = getTarget(currIdx)

        await wrapCb(ctx, target.confirm?.callback);

        if (currIdx < Object.keys(stages).length - 1) {
          $intro.idx(ctx, ++currIdx);
        }
      }),
      back: action(async (ctx) => {
        let currIdx = ctx.get($intro.idx)
        $intro.idx(ctx, --currIdx);
      }),
      refsMap: reatomMap<"confirmBtn" | "backButton", HTMLButtonElement | null>(null, `${name}.refsMap`).pipe(withReset()),
      // target summary fields (pseudo)
      firstName: atom<string>("", `${name}.firstName`).pipe(withReset()),
      interests: atom<string[]>([], `${name}.interests`).pipe(withReset()),
      style: atom<UserStyle | null>(null, `${name}.style`).pipe(withReset()),
      goal: atom<string | null>(null, `${name}.goal`).pipe(withReset()),
      location: atom<SummaryData["location"] | null>(null, `${name}.location`).pipe(withReset()),
      resetTargetSummaryFields: action((ctx) => {
        $intro.firstName.reset(ctx);
        $intro.interests.reset(ctx);
        $intro.style.reset(ctx);
        $intro.goal.reset(ctx);
        $intro.location.reset(ctx);
      }),
    }))
  )

  const getTarget = (idx: number) => {
    const target = stages[idx]
    if (!target) throw new Error(`No stage found for index ${idx}`)
    return target
  }

  // atom that determines if the next stage is valid based on the current stage's condition
  // by default if value is false, the confirm button is hidden
  const $isNext = atom((ctx) => {
    const currIdx = ctx.spy($intro.idx)
    if (currIdx === Object.keys(stages).length) return false;
    return true;
  }, name(`isNext`)).pipe(withLog());

  const $isValid = atom((ctx) => {
    const currIdx = ctx.spy($intro.idx)
    const target = getTarget(currIdx);

    const cd = target.confirm?.when;
    if (!cd) return true;

    return cd(ctx)
  }, name(`isValid`)).pipe(withLog())

  const $isBack = atom((ctx) => {
    const currIdx = ctx.spy($intro.idx)
    if (currIdx === 0) return false;

    const target = getTarget(currIdx);

    const cd = target.back?.when;
    if (cd === undefined) return true;

    return cd(ctx)
  }, name(`isBack`)).pipe(withLog());

  wrapCb.statusesAtom.onChange((ctx, state) => {
    const isDisabled = state.isPending || state.isRejected

    const ref = $intro.refsMap.get(ctx, "backButton")
    if (!ref) return;

    ref.disabled = isDisabled
  })

  $isBack.onChange((ctx, state) => {
    if (state) {
      const l = () => BackButton({
        onClick: () => {
          $intro.back(ctx)
        },
        ref: (el) => {
          $intro.refsMap.set(ctx, "backButton", el)
        }
      });

      $headerNodes.update(ctx, { l }, {
        withSnapshot: false
      })
    } else {
      $header.nodes(ctx, (state) => ({ ...state, l: null }))
    }
  })

  const $confirmLabel = atom<string | null>((ctx) => {
    const rules = STAGES_CONFIRM_LABELS[ctx.spy($intro.idx)];
    if (!rules) return null;

    const matchedRule = rules.find((rule) => rule.when(ctx));
    if (!matchedRule) return null;

    return matchedRule.label();
  }, name(`confirmLabel`)).pipe(withLog())

  const $hasInterest = (target: string) => compareAtom($intro.interests, (curr) => curr.includes(target))
  const $isGoal = (target: string) => compareAtom($intro.goal, (curr) => curr === target)
  const $isStyle = (target: string) => compareAtom($intro.style, (curr) => curr === target)

  return {
    $intro,
    wrapCb,
    $isStyle,
    $isGoal,
    $hasInterest,
    $confirmLabel,
    $isNext,
    $isBack,
    $isValid,
  }
})

export const {
  $intro, wrapCb, $isNext, $isBack, $isValid, $confirmLabel, $isGoal, $hasInterest, $isStyle
} = $introModel
