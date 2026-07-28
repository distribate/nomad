import { useAtom, useCtx } from "@reatom/npm-solid-js"
import { $hasInterest, $introduction, $isGoal, $isStyle } from "./model";
import { Dynamic, For } from "solid-js/web";
import { createSignal, Match, Show, type JSX, Switch, type ParentProps, onMount } from "solid-js";
import { Button } from "../../ui/button";
import { Navigation } from "./navigation";
import { action, entries, reatomMap } from "@reatom/framework";
import { Input } from "../../ui/input";
import { MasonryGrid } from "../../ui/grid";
import { GOALS, INTERESTS, STYLES } from "./data";
import { defineRefAtom, useAtomAccessor } from "../../../lib/reatom";
import { getGsap } from "../../../lib/gsap";
import { Block, Title, titleTextStyle } from "./primitives";
import cn from "cnfast";

const STEPS: Record<number, (props: ParentProps) => JSX.Element> = {
  0: () => {
    const ctx = useCtx();

    return (
      <div class="flex flex-col text-center h-full w-full items-center justify-between">
        <p
          ref={defineRefAtom(ctx, "title", $refsMap)}
          class={cn(titleTextStyle, "text-center")}
        >
          Находи людей.
          Исследуй больше.
        </p>
      </div>
    )
  },
  1: () => (
    <div class="flex flex-col text-center h-full gap-4 w-full items-center">
      <p class="text-lg">
        Не хочется идти одному?
        Найди людей для путешествий, походов и приключений.
        🥾 Хайкинг
        🏕 Кемпинг
        🌍 Путешествия
      </p>
      <div>
        Выбери приключение
        Найди маршрут или создай свой 🏔
      </div>
      <div>
        Найди своих людей
        Совпадение по:
        ✓ интересам
        ✓ темпу
        ✓ уровню подготовки
        👥
      </div>
      <div>
        Идите вместе
        Общайтесь, планируйте и создавайте воспоминания 🔥
      </div>
    </div>
  ),
  2: () => {
    const ctx = useCtx();
    const [value] = useAtom($introduction.firstName);

    return (
      <div class="flex flex-col text-center h-full gap-6 w-full items-center">
        <Title as="text" msg="Как тебя зовут?" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            $introduction.next(ctx)
          }}
          class="w-full justify-center flex"
        >
          <Input
            type="text"
            required
            value={value()}
            size="lg"
            class="w-full"
            onChange={(e) => $introduction.firstName(ctx, e.target.value)}
          />
        </form>
      </div>
    )
  },
  3: () => {
    const ctx = useCtx();
    const [firstName] = useAtom($introduction.firstName);

    return (
      <div class="flex flex-col text-center h-full gap-6 w-full items-center">
        <Title as="node">
          <div class="flex flex-col items-start w-full">
            <p class="text-3xl font-semibold leading-10">
              Что тебе ближе, <span class="text-brand-default">{firstName()}</span>?
            </p>
            <span class="text-md text-neutral-400">
              Выбери несколько вариантов
            </span>
          </div>
        </Title>
        <MasonryGrid
          items={entries(INTERESTS)}
          columns={3}
          gap="6px"
          getWeight={([k]) => k.length > 12 ? 2 : 1}
          renderItem={([k, v]) => (
            <Block
              variant={useAtomAccessor($hasInterest(k))() ? "active" : "inactive"}
              onClick={() => {
                $introduction.interests(ctx, state =>
                  state.includes(k) ? state.filter(c => c !== k) : [...state, k]
                );
              }}
            >
              {v}
            </Block>
          )}
        />
      </div >
    )
  },
  4: () => {
    const ctx = useCtx();

    return (
      <div class="flex flex-col text-center text-lg h-full gap-4 w-full items-center">
        <Title as="text" msg="Как обычно путешествуешь?" />
        <div class="flex flex-wrap gap-3 w-full">
          <For each={entries(STYLES)}>
            {([k, v]) => (
              <Block
                variant={useAtomAccessor($isStyle(k))() ? "active" : "inactive"}
                onClick={() => $introduction.style(ctx, k)}
              >
                <p>
                  {v}
                </p>
              </Block>
            )}
          </For>
        </div>
      </div>
    )
  },
  5: () => {
    const ctx = useCtx();

    return (
      <div class="flex flex-col text-center text-lg gap-4 h-full w-full items-center">
        <Title as="text" msg="Что хочешь найти?" />
        <div class="flex flex-wrap gap-3 w-full">
          <For each={entries(GOALS)}>
            {([k, v]) => (
              <Block
                variant={useAtomAccessor($isGoal(k))() ? "active" : "inactive"}
                onClick={() => $introduction.goal(ctx, k)}
              >
                <p>
                  {v}
                </p>
              </Block>
            )}
          </For>
        </div>
      </div>
    )
  },
  6: () => {
    const [isSetuped, setIsSetuped] = createSignal(false);

    const ctx = useCtx();

    const setupLocation = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        const result = $introduction.location(ctx, {
          latitude, longitude,
        });

        if (result) {
          setIsSetuped(true);
        }
      });
    }

    return (
      <div class="flex flex-col text-center gap-4 h-full w-full items-center">
        <Title as="text" msg="Где ты сейчас? Мы покажем людей и события рядом" />
        <div class="flex flex-col lg:flex-row gap-2 w-full items-center justify-center">
          <Switch>
            <Match when={!isSetuped()}>
              <Button
                class="bg-brand-default text-primary text-sm"
                onClick={setupLocation}
              >
                📍 Использовать текущую локацию
              </Button>
              <Button
                class="text-sm"
                onClick={() => {
                  $introduction.location(ctx, null);
                }}
              >
                Выбрать локацию вручную
              </Button>
            </Match>
            <Match when={isSetuped()}>
              <p class="text-brand-default">
                Все ок! Можно продолжить
              </p>
            </Match>
          </Switch>
        </div>
      </div>
    )
  },
  7: () => {
    const firstName = useAtomAccessor($introduction.firstName);
    const interests = useAtomAccessor($introduction.interests);
    const style = useAtomAccessor($introduction.style);
    const goal = useAtomAccessor($introduction.goal);

    return (
      <div class="flex flex-col text-center gap-6 text-lg h-full w-full items-start">
        <Title as="text" msg="Итак," />
        <div class="flex flex-col items-start w-full gap-2">
          <p class="text-left">
            Вас зовут {firstName()}, ваш стиль: {style()},
            интересуетесь {interests()?.join(', ')},
            ваш целью является {goal()}
          </p>
        </div>
      </div>
    )
  }
}

const $refsMap = reatomMap<"appName" | "title", HTMLParagraphElement | null>(new Map(), "refsMap")

const startFirstFrameAnim = action((ctx) => {
  const t1 = $refsMap.get(ctx, "appName")
  const t2 = $refsMap.get(ctx, "title")
  const t3 = ctx.get($introduction.confirmBtnRef)

  if (!t1 || !t2 || !t3) return

  const gsap = getGsap();

  gsap.set(t1, {
    y: window.innerHeight * 0.3,
    opacity: 0,
    filter: "blur(20px)"
  })

  gsap.set(t2, {
    opacity: 0
  })

  gsap.set(t3, {
    opacity: 0,
    filter: "blur(20px)"
  })

  const tl = gsap.timeline()

  tl
    .to(t1, {
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.8,
      ease: "power3.out"
    })
    .to(t1, {
      y: 0,
      duration: 0.8,
      ease: "power3.inOut"
    })
    .to(t2, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    }, "<0.25")
    .to({}, {
      duration: 0.2
    })
    .to(t3, {
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.8,
      ease: "power3.out"
    })
}, "startFirstFrameAnim")

export const Introduction = () => {
  const ctx = useCtx();

  const [idx] = useAtom($introduction.idx);
  const component = () => STEPS[idx()]

  onMount(() => {
    startFirstFrameAnim(ctx)
  })

  return (
    <div class="flex flex-col p-4 w-full h-full items-center justify-between">
      <div class="flex h-[40dvh] w-full items-start justify-center">
        <p
          ref={defineRefAtom(ctx, "appName", $refsMap)}
          class="font-semibold leading-8 relative text-4xl"
        >
          Nomad
        </p>
      </div>
      <div class="flex flex-col items-start justify-center gap-6 grow w-full">
        <Dynamic component={component()} />
      </div>
      <Navigation />
    </div>
  )
}
