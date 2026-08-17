import { useCtx } from "@reatom/npm-solid-js";
import { Show } from "solid-js";
import { $anim, $confirmLabel, $intro, $isBack, $isNext, $isValid, $refsMap } from "./model";
import { Button } from "../../ui/button";
import { defineRefAtom, useAtomAccessor } from "../../../lib/reatom";

export const Navigation = () => {
  const ctx = useCtx();

  const isNext = useAtomAccessor($isNext)
  const isValid = useAtomAccessor($isValid)
  const _ = useAtomAccessor($isBack)

  const inAnimStyle = useAtomAccessor($anim.in)
  const beforeAnimStyle = useAtomAccessor($anim.before);

  const confirmLabel = useAtomAccessor($confirmLabel)

  return (
    <div class="flex items-center h-20 gap-2 w-full justify-center">
      <Show when={isNext()}>
        <Button
          ref={defineRefAtom(ctx, "confirmBtn", $refsMap, "intro")}
          disabled={!isValid()}
          onClick={() => $intro.next(ctx)}
          class="text-lg w-full py-6 px-6"
          style={{
            ...beforeAnimStyle(),
            ...inAnimStyle()
          }}
        >
          {confirmLabel() ?? "Продолжить"}
        </Button>
      </Show>
    </div>
  )
}
