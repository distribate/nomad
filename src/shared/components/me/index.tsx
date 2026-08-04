import { useCtx } from "@reatom/npm-solid-js";
import { $user } from "../../../lib/user/user.model"
import { Button } from "../../ui/button";
import { For, Show } from "solid-js";
import { Icon } from "../../ui/icon";
import { WithTopPadding } from "../global/layouts";
import { me_events } from "./model";
import { useAtomAccessor } from "../../../lib/reatom";
import { setupDevModule } from "../../../lib/helpers";
import { MeHeader } from "./primitives";

const MeEvents = () => {
  const ctx = useCtx()

  return (
    <div class="flex h-14 *:h-full *:w-1/3 gap-2 w-full items-center justify-between">
      <For each={me_events}>
        {(data) => (
          <Button
            variant="neutral"
            onClick={() => data.action(ctx)}
            class="flex flex-col"
          >
            <Icon name={data.icon} class="size-6" />
            <span class="leading-3 text-[13px]">
              {data.label}
            </span>
          </Button>
        )}
      </For>
    </div>
  )
}

export const Me = () => {
  const ctx = useCtx();
  const me = useAtomAccessor($user.data);

  setupDevModule(
    ctx, () => import("./model.dev"), (m) => m.$meDev
  )

  return (
    <WithTopPadding class="flex flex-col h-full w-full gap-4 p-4">
      <Show when={me()}>
        {(data) => (
          <MeHeader
            me={data()}
            avatar={{ as: "readonly", photo: data().photo, alt: data().firstName }}
          />
        )}
      </Show>
      <MeEvents />
    </WithTopPadding>
  )
}
