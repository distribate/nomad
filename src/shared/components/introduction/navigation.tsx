import { useAtom, useCtx } from "@reatom/npm-solid-js";
import { Show } from "solid-js";
import { $introduction, $isBack, $isNext } from "./model";
import { Button } from "../../ui/button";

export const Navigation = (props?: { nextLabel?: string, backLabel?: string }) => {
  const ctx = useCtx();
  const [isNext] = useAtom($isNext)
  const [_] = useAtom($isBack)

  return (
    <div class="flex items-center gap-2 w-full justify-center">
      <Show when={isNext()}>
        <Button onClick={() => $introduction.next(ctx)} class="text-lg w-full py-6 px-6">
          {props?.nextLabel ?? "Продолжить"}
        </Button>
      </Show>
    </div>
  )
}
