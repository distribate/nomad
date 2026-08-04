import { useCtx } from "@reatom/npm-solid-js"
import { $hasInterest, $intro, $isGoal, $isStyle, STAGES_MAP } from "./model";
import { Dynamic, For } from "solid-js/web";
import { createSignal, Match, onMount, type JSX, Switch, type ParentProps, onCleanup } from "solid-js";
import { Button } from "../../ui/button";
import { Navigation } from "./navigation";
import { action, entries } from "@reatom/framework";
import { Input } from "../../ui/input";
import { MasonryGrid } from "../../ui/grid";
import { GOALS, INTERESTS, STYLES } from "./data";
import { defineRefAtom, useAtomAccessor } from "../../../lib/reatom";
import { getGsap } from "../../../lib/gsap";
import { Block, Title, titleTextStyle } from "./primitives";
import cn from "cnfast";
import { setupDevModule } from "../../../lib/helpers";

const STEPS: Record<number, (props: ParentProps) => JSX.Element> = {
  [STAGES_MAP.SPLASH]: () => {
    const ctx = useCtx();

    return (
      <div class="flex flex-col text-center h-full w-full items-center justify-between">
        <p
          ref={defineRefAtom(ctx, "title", $intro.refsMap, "intro")}
          class={cn(titleTextStyle, "text-center opacity-0")}
        >
          Находи людей.
          Исследуй больше.
        </p>
      </div>
    )
  },
  [STAGES_MAP.VALUE_PROPOSITION]: () => (
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
  [STAGES_MAP.WELCOMING]: () => {
    const ctx = useCtx();
    const value = useAtomAccessor($intro.firstName);

    return (
      <div class="flex flex-col text-center h-full gap-6 w-full items-center">
        <Title as="text" msg="Как тебя зовут?" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            $intro.next(ctx)
          }}
          class="w-full justify-center flex"
        >
          <Input
            type="text"
            required
            value={value()}
            size="lg"
            class="w-full"
            onInput={(e) => $intro.firstName(ctx, e.target.value)}
          />
        </form>
      </div>
    )
  },
  [STAGES_MAP.INTERESTS]: () => {
    const ctx = useCtx();
    const firstName = useAtomAccessor($intro.firstName);

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
          getWeight={([key]) => key.length > 12 ? 2 : 1}
          renderItem={([key, label]) => {
            const hasInterest = useAtomAccessor($hasInterest(key));

            const handleClick = () => {
              $intro.interests(ctx, state =>
                state.includes(key) ? state.filter(c => c !== key) : [...state, key]
              );
            }

            return (
              <Block
                variant={hasInterest() ? "active" : "inactive"}
                onClick={handleClick}
              >
                {label}
              </Block>
            )
          }}
        />
      </div>
    )
  },
  [STAGES_MAP.STYLE]: () => {
    const ctx = useCtx();

    return (
      <div class="flex flex-col text-center text-lg h-full gap-4 w-full items-center">
        <Title as="text" msg="Как обычно путешествуешь?" />
        <div class="flex flex-wrap gap-3 w-full">
          <For each={entries(STYLES)}>
            {([key, label]) => {
              const isStyle = useAtomAccessor($isStyle(key));

              const handleClick = () => {
                $intro.style(ctx, key)
              }

              return (
                <Block
                  variant={isStyle() ? "active" : "inactive"}
                  onClick={handleClick}
                >
                  {label}
                </Block>
              )
            }}
          </For>
        </div>
      </div>
    )
  },
  [STAGES_MAP.GOALS]: () => {
    const ctx = useCtx();

    return (
      <div class="flex flex-col text-center text-lg gap-4 h-full w-full items-center">
        <Title as="text" msg="Что хочешь найти?" />
        <div class="flex flex-wrap gap-3 w-full">
          <For each={entries(GOALS)}>
            {([key, label]) => {
              const isGoal = useAtomAccessor($isGoal(key));

              const handleClick = () => {
                $intro.goal(ctx, key)
              }

              return (
                <Block
                  variant={isGoal() ? "active" : "inactive"}
                  onClick={handleClick}
                >
                  {label}
                </Block>
              )
            }}
          </For>
        </div>
      </div>
    )
  },
  [STAGES_MAP.LOCATION]: () => {
    const [isSetuped, setIsSetuped] = createSignal(false);

    const ctx = useCtx();

    const setupLocation = () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        const result = $intro.location(ctx, {
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
                  $intro.location(ctx, null);
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
  [STAGES_MAP.PHOTO]: () => {
    const ctx = useCtx();

    const [preview, setPreview] = createSignal<string>('');
    let fileInputRef!: HTMLInputElement;

    const handleFileChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      if (preview() && preview().startsWith('blob:')) {
        URL.revokeObjectURL(preview());
      }

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      $intro.photo(ctx, { src: objectUrl })
    };

    onCleanup(() => {
      if (preview() && preview().startsWith('blob:')) {
        URL.revokeObjectURL(preview());
      }
    });

    return (
      <div class="relative group w-32 h-32 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          class="hidden"
          onChange={handleFileChange}
        />
        {preview() ? (
          <img
            src={preview()}
            alt="Profile avatar"
            class="w-full h-full object-cover"
          />
        ) : (
          <div class="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
            Нет фото
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.click()}
          class="
            absolute inset-0 bg-black/50 text-white text-xs opacity-0
            group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer font-medium
          "
        >
          Изменить
        </button>
      </div>
    )
  },
  [STAGES_MAP.CONFIRM]: () => {
    const firstName = useAtomAccessor($intro.firstName);
    const interests = useAtomAccessor($intro.interests);
    const style = useAtomAccessor($intro.style);
    const goal = useAtomAccessor($intro.goal);

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

const startFirstFrameAnim = action((ctx) => {
  const t1 = $intro.refsMap.get(ctx, "appName")
  const t2 = $intro.refsMap.get(ctx, "title")
  const t3 = $intro.refsMap.get(ctx, "confirmBtn")

  if (!t1 || !t2 || !t3) {
    console.warn("t1, t2, or t3 is null", { t1, t2, t3 })
    return
  }

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

  const idx = useAtomAccessor($intro.idx);
  const component = () => STEPS[idx()]

  setupDevModule(ctx, () => import('./model.dev'), (m) => m.$introDev);

  onMount(() => {
    startFirstFrameAnim(ctx)
  })

  return (
    <div class="flex flex-col p-4 w-full h-full items-center justify-between">
      <div class="flex h-[40dvh] w-full items-start justify-center">
        <p
          ref={defineRefAtom(ctx, "appName", $intro.refsMap, "intro")}
          class="font-semibold opacity-0 leading-8 relative text-4xl"
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
