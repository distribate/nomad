import { useAtom, useCtx } from "@reatom/npm-solid-js";
import { Show } from "solid-js";
import { $confirmLabel, $introduction, $isBack, $isNext, $isValid } from "./model";
import { Button } from "../../ui/button";
import { defineRefAtom } from "../../../lib/reatom";

export const Navigation = () => {
  const ctx = useCtx();

  const [isNext] = useAtom($isNext)
  const [isValid] = useAtom($isValid)
  const [_] = useAtom($isBack)

  const [confirmLabel] = useAtom($confirmLabel)

  return (
    <div class="flex items-center h-20 gap-2 w-full justify-center">
      <Show when={isNext()}>
        <Button
          ref={defineRefAtom(ctx, "confirmBtn", $introduction.confirmBtnRef)}
          disabled={!isValid()}
          onClick={() => $introduction.next(ctx)}
          class="text-lg w-full py-6 px-6"
        >
          {confirmLabel() ?? "Продолжить"}
        </Button>
      </Show>
    </div>
  )
}
