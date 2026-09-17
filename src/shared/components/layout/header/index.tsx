import { useCtx } from "@reatom/npm-solid-js"
import { $header } from "./model"
import { onCleanup, onMount, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useAtomAccessor } from "@/lib/helpers/reatom";

const Slot = (props: {
  component?: AnyComponent | null
  class: string
}) => (
  <div
    class={`pointer-events-none flex min-w-0 ${props.class}`}
    classList={{
      "pointer-events-auto": !!props.component,
    }}
  >
    <Show when={props.component}>
      {component => <Dynamic component={component()} />}
    </Show>
  </div>
)

export const Header = () => {
  const ctx = useCtx();

  const elements = useAtomAccessor($header.nodes);
  const meta = useAtomAccessor($header.meta);

  let ref!: HTMLElement

  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      $header.height(ctx, entry.borderBoxSize[0].blockSize)
    })

    observer.observe(ref)

    onCleanup(() => observer.disconnect())
  })

  return (
    <div class="relative w-full">
      <Show when={meta().withBlur}>
        {(_) => (
          <div
            class="
              pointer-events-none
              absolute inset-x-0 top-0 z-2
              h-20 backdrop-blur-md
              mask-[linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]
              bg-linear-to-b from-white/10 via-white/10 to-transparent
            "
          />
        )}
      </Show>
      <div
        ref={el => (ref = el)}
        class="pointer-events-none absolute top-2 right-4 left-4 z-4 flex h-14 items-center justify-between gap-2"
      >
        <Slot
          component={elements().l}
          class="w-10 shrink-0 justify-start"
        />
        <Slot
          component={elements().c}
          class="flex-1 justify-center text-center"
        />
        <Slot
          component={elements().r}
          class="max-w-1/6 shrink-0 justify-end"
        />
      </div>
    </div>
  )
}
