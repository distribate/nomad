import { useCtx } from "@reatom/npm-solid-js";
import { Show } from "solid-js";
import { $confirmLabel, $intro, $isBack, $isNext, $isValid } from "./model";
import { Button } from "../../ui/button";
import { defineRefAtom, useAtomAccessor } from "../../../lib/reatom";

export const Navigation = () => {
  const ctx = useCtx();

  const isNext = useAtomAccessor($isNext)
  const isValid = useAtomAccessor($isValid)
  const _ = useAtomAccessor($isBack)

  const confirmLabel = useAtomAccessor($confirmLabel)

  return (
    <div class="flex items-center h-20 gap-2 w-full justify-center">
      <Show when={isNext()}>
        <Button
          ref={defineRefAtom(ctx, "confirmBtn", $intro.refsMap)}
          disabled={!isValid()}
          onClick={() => $intro.next(ctx)}
          class="text-lg w-full py-6 px-6 opacity-0"
        >
          {confirmLabel() ?? "Продолжить"}
        </Button>
      </Show>
    </div>
  )
}
