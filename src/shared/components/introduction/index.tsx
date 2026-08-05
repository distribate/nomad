import { useCtx } from "@reatom/npm-solid-js"
import { $hasInterest, $anim, $intro, $isGoal, $isStyle, setupLocation, STAGES_MAP, startFirstFrameAnim } from "./model";
import { Dynamic, For } from "solid-js/web";
import {
  createSignal, Match, onMount,
  type JSX, Switch, type ParentProps, onCleanup
} from "solid-js";
import { Button } from "../../ui/button";
import { Navigation } from "./navigation";
import { entries } from "@reatom/framework";
import { Input } from "../../ui/input";
import { MasonryGrid } from "../../ui/grid";
import { GOALS, INTERESTS, STYLES } from "./data";
import { defineRefAtom, useAtomAccessor } from "../../../lib/reatom";
import { Block, Title, titleTextStyle } from "./primitives";
import cn from "cnfast";
import { setupDevModule } from "../../../lib/helpers";

const Splash = () => {
  const ctx = useCtx();
  const inAnimStyle = useAtomAccessor($anim.in)
  const beforeAnimStyle = useAtomAccessor($anim.before);

  return (
    <div class="flex flex-col text-center h-full w-full items-center justify-between">
      <p
        ref={defineRefAtom(ctx, "title", $intro.refsMap, "intro")}
        class={cn(titleTextStyle, "text-center")}
        style={{
          ...beforeAnimStyle(),
          ...inAnimStyle()
        }}
      >
        Находи людей.
        Исследуй больше.
      </p>
    </div>
  )
}
const Photo = () => {
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
    <div
      class="
        relative group w-32 h-32 rounded-full
        overflow-hidden bg-neutral-800 border border-neutral-700
      "
    >
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
          group-hover:opacity-100 transition-opacity
          flex items-center justify-center cursor-pointer font-medium
        "
      >
        Изменить
      </button>
    </div>
  )
}
const Proposition = () => {
  return (
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
  )
}
const Welcoming = () => {
  const ctx = useCtx();
  const firstName = useAtomAccessor($intro.firstName);

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
          variant="headless"
          type="text"
          required
          value={firstName()}
          size="lg"
          class="w-full"
          placeholder="Имя"
          onInput={(e) => $intro.firstName(ctx, e.target.value)}
        />
      </form>
    </div>
  )
}
const Interests = () => {
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
}
const Style = () => {
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
}
const Goals = () => {
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
}
const Location = () => {
  const [isSetuped, setIsSetuped] = createSignal(false);
  const statuses = useAtomAccessor(setupLocation.statusesAtom);

  const ctx = useCtx();

  return (
    <div class="flex flex-col text-center gap-4 h-full w-full items-center">
      <Title as="text" msg="Где ты сейчас? Мы покажем людей и события рядом" />
      <div class="flex flex-col lg:flex-row gap-2 w-full items-center justify-center">
        <Switch>
          <Match when={statuses().isPending}>
            <p>Загрузка...</p>
          </Match>
          <Match when={!isSetuped()}>
            <Button
              class="bg-brand-default text-primary text-sm"
              onClick={() => setupLocation(ctx, () => setIsSetuped(true))}
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
}
const Confirm = () => {
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

const STEPS: Record<number, (props: ParentProps) => JSX.Element> = {
  [STAGES_MAP.SPLASH]: Splash,
  [STAGES_MAP.VALUE_PROPOSITION]: Proposition,
  [STAGES_MAP.WELCOMING]: Welcoming,
  [STAGES_MAP.INTERESTS]:Interests,
  [STAGES_MAP.STYLE]: Style,
  [STAGES_MAP.GOALS]: Goals,
  [STAGES_MAP.LOCATION]: Location,
  [STAGES_MAP.PHOTO]: Photo,
  [STAGES_MAP.CONFIRM]: Confirm
}

export const Introduction = () => {
  const ctx = useCtx();

  const idx = useAtomAccessor($intro.idx);
  const component = () => STEPS[idx()]
  const inAnimStyle = useAtomAccessor($anim.in)
  const beforeAnimStyle = useAtomAccessor($anim.before);

  setupDevModule(ctx, () => import('./model.dev'), (m) => m.$introDev);

  onMount(() => {
    startFirstFrameAnim(ctx)
  })

  return (
    <div class="flex flex-col p-4 w-full h-full items-center justify-between">
      <div class="flex h-[40dvh] w-full items-start justify-center">
        <p
          ref={defineRefAtom(ctx, "appName", $intro.refsMap, "intro")}
          class="font-semibold leading-8 relative text-4xl"
          style={{
            ...beforeAnimStyle(),
            ...inAnimStyle()
          }}
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
