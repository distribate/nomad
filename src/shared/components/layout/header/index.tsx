import { useAtom, useCtx } from "@reatom/npm-solid-js"
import { $header } from "./model"
import { onCleanup, onMount } from "solid-js";
import { Dynamic } from "solid-js/web";

const Empty = () => <div />

export const Header = () => {
  const ctx = useCtx();

  const [elements] = useAtom($header.nodes);

  let ref!: HTMLElement

  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      $header.height(ctx, entry.borderBoxSize[0].blockSize)
    })

    observer.observe(ref)

    onCleanup(() => observer.disconnect())
  })

  return (
    <div
      ref={el => (ref = el)}
      class="flex z-4 gap-4 items-center justify-between w-full px-4 py-1 h-14 rounded-b-lg absolute top-0 right-0 left-0"
    >
      <div class="w-1/4 shrink-0 flex items-center justify-start min-w-0">
        <Dynamic component={elements().l ?? Empty} />
      </div>
      <div class="flex-1 min-w-0 text-center truncate">
        <Dynamic component={elements().c ?? Empty} />
      </div>
      <div class="w-1/4 shrink-0 flex items-center justify-end min-w-0">
        <Dynamic component={elements().r ?? Empty} />
      </div>
    </div>
  )
}
