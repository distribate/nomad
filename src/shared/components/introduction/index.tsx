import { useAtom, useCtx } from "@reatom/npm-solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { $introduction } from "./model";
import { Dynamic, For } from "solid-js/web";
import { Show, type ParentProps } from "solid-js";
import { Button } from "../../ui/button";
import { Navigation } from "./navigation";
import { atom } from "@reatom/framework";

type StepComponentProps = ParentProps

const CHIPS = [
  "🥾 Хайкинг",
  "🏔 Горы",
  "🏕 Кемпинг",
  "🚲 Велопоходы",
  "🌊 Пляжи",
  "📸 Фото",
  "🗺 Путешествия",
  "🔥 Костры",
]

const includesInInterestsAtom = (target: string) => atom((ctx) => ctx.spy($introduction.interests).includes(target))

const STEPS: Record<number, (props: StepComponentProps) => JSX.Element> = {
  0: () => (
    <div class="flex flex-col text-center h-full w-full items-center justify-between">
      <div class="h-1/2 flex w-full items-start justify-center">
        <p class="font-semibold relative top-20 text-4xl">
          Nomad
        </p>
      </div>
      <div class="flex h-1/2 flex-col items-center justify-start gap-6">
        <p class="text-lg">
          Находи людей.
          Исследуй больше.
        </p>
      </div>
    </div>
  ),
  1: () => (
    <div class="flex flex-col text-center h-full gap-4 w-full items-center justify-center">
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
      <div class="flex flex-col text-center  h-full gap-4 w-full items-center justify-center">
        <p class="text-lg">
          Как тебя зовут?
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            $introduction.next(ctx)
          }}
        >
          <input
            type="text"
            required
            value={value()}
            onChange={(e) => $introduction.firstName(ctx, e.target.value)}
          />
        </form>
      </div>
    )
  },
  3: () => {
    const ctx = useCtx();

    return (
      <div class="flex flex-col text-center  h-full gap-4 w-full items-center justify-center">
        <p>
          Что тебе ближе?
          Выбери несколько
        </p>
        <div>
          <For each={CHIPS}>
            {(chip) => {
              const [isExist] = useAtom(includesInInterestsAtom(chip))

              return (
                <div
                  class={`flex rounded-lg px-2 py-1 ${isExist() ? "bg-brand-default" : "bg-white/10"}`}
                  onClick={() => {
                    $introduction.interests(ctx, (state) => {
                      const isExist = state.includes(chip)
                      return isExist ? state.filter((c) => c !== chip) : [...state, chip]
                    })
                  }}
                >
                  {chip}
                </div>
              )
            }}
          </For>
        </div>
      </div>
    )
  },
  4: () => {
    // const ctx = useCtx();

    return (
      <div class="flex flex-col text-center  h-full gap-4 w-full items-center justify-center">
        Как обычно путешествуешь?
        <div>
          🥾 Спокойно

          10-15 км
          Люблю красивые места
        </div>
        <div>
          🏃 Активно

          20-30 км
          Люблю вызовы
        </div>
        <div>
          🏔 Экстрим

          Сложные маршруты
          Высота
        </div>
      </div>
    )
  },
  5: () => (
    <div class="flex flex-col text-center gap-4  h-full w-full items-center justify-center">
      Что хочешь найти?
      <div>
        👥 Компанию
        Найти людей для совместных поездок
      </div>
      <div>
        ❤️ Новых друзей
        Общение и приключения
      </div>
      <div>
        ✨ Больше
        Возможно что-то большее
      </div>
    </div>
  ),
  6: () => (
    <div class="flex flex-col text-center gap-4  h-full w-full items-center justify-center">
      <p>
        Где ты сейчас?
        Мы покажем людей
        и события рядом
      </p>
      <div class="flex flex-col lg:flex-row gap-2 w-full items-center justify-center">
        <Button class="bg-brand-default text-primary">
          📍 Использовать мою локацию
        </Button>
        <Button>
          Выбрать город вручную
        </Button>
      </div>
    </div>
  ),
  7: () => {
    const [data] = useAtom($introduction.data);

    return (
      <Show when={data()} fallback={<span>empty</span>}>
        {(data) => (
          <div class="flex flex-col text-center gap-4  h-full w-full items-center justify-center">
            <p>
              {data().firstName}
            </p>
          </div>
        )}
      </Show>
    )
  }
}

export const Introduction = () => {
  const [idx] = useAtom($introduction.idx);
  const component = () => STEPS[idx()]

  return (
    <div class="flex flex-col w-full h-full items-center justify-between">
      <Dynamic component={component()} />
      <Navigation />
    </div>
  )
}
