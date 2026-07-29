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

    onCleanup(() => {
      observer.disconnect();
    })
  })

  return (
    <div
      ref={el => (ref = el)}
      class="flex z-4 *:max-w-1/3 items-center justify-between w-full px-4 py-1 h-14 rounded-b-lg absolute top-0 right-0 left-0"
    >
      <Dynamic component={elements().l ?? Empty} />
      <Dynamic component={elements().c ?? Empty} />
      <Dynamic component={elements().r ?? Empty} />
    </div>
  )
}
