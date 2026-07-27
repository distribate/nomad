import { useAtom, useCtx } from "@reatom/npm-solid-js"
import { $header } from "./model"
import { onCleanup, onMount, Show } from "solid-js";
import { $user } from "../../../../lib/user/user.model";
import { atom, withReset } from "@reatom/framework";
import { Dynamic } from "solid-js/web";

export const $headerHeight = atom<number>(0, "headerHeight").pipe(withReset())

const HeaderProfileBadge = () => {
  const [user] = useAtom($user.data)

  return (
    <Show when={user()}>
      {(d) => (
        <div class="flex items-center justify-end w-fit h-full">
          <a href="/me" class="flex items-center justify-center bg-white rounded-full h-full aspect-square">
            <span class="text-black font-semibold">{d().firstName[0]}</span>
          </a>
        </div>
      )}
    </Show>
  )
}

const Empty = () => <div />

export const Header = () => {
  const ctx = useCtx();

  const [elements] = useAtom($header.nodes);

  let ref!: HTMLElement

  onMount(() => {
    $header.nodes(ctx, (state) => ({ ...state, r: HeaderProfileBadge }))
  })

  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      $headerHeight(ctx, entry.borderBoxSize[0].blockSize)
    })

    observer.observe(ref)

    onCleanup(() => {
      observer.disconnect();
    })
  })

  return (
    <div
      ref={el => (ref = el)}
      class="flex z-4 *:max-w-1/3 *:border items-center justify-between w-full px-4 py-3 h-16 rounded-b-lg absolute top-0 right-0 left-0"
    >
      <Dynamic component={elements().l ?? Empty} />
      <Dynamic component={elements().c ?? Empty} />
      <Dynamic component={elements().r ?? Empty} />
    </div>
  )
}
