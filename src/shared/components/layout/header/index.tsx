import { useAtom } from "@reatom/npm-solid-js"
import { $header } from "./model"
import { For } from "solid-js";

export const Header = () => {
  const [elements] = useAtom($header.nodes);

  return (
    <div class="flex items-center justify-between w-full px-2 h-14 rounded-b-lg absolute top-0 right-0 left-0">
      <For each={Array.from(elements().values())}>
        {(Element) => {
          return (
            <>
              {Element ? <Element /> : null}
            </>
          )
        }}
      </For>
    </div>
  )
}
