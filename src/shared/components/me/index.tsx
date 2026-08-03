import { useCtx } from "@reatom/npm-solid-js";
import { $user, type User } from "../../../lib/user/user.model"
import { Button } from "../../ui/button";
import { For, Show } from "solid-js";
import { Icon } from "../../ui/icon";
import { WithTopPadding } from "../layouts";
import { me_events } from "./model";
import { useAtomAccessor } from "../../../lib/reatom";
import { setupDevModule } from "../../../lib/helpers";

export const MeHeader = (props: { me: User }) => {
  return (
    <div class="flex flex-col gap-2 items-center justify-center w-full">
      <div class="flex h-26 aspect-square">
        <Show
          when={props.me.photo?.src}
          fallback={
            <span class="text-bold text-lg">{props.me.firstName?.[0] ?? " "}</span>
          }
        >
          {(data) => (
            <img
              src={data()}
              alt={props.me.firstName}
              class="w-full h-full object-cover rounded-full"
            />
          )}
        </Show>
      </div>
      <div class="flex flex-col items-center justify-center w-full">
        <p class="font-semibold text-base">
          {props.me.firstName}
        </p>
        <p class="text-neutral-400 text-sm">online</p>
      </div>
    </div>
  )
}

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
        {(data) => <MeHeader me={data()} />}
      </Show>
      <MeEvents />
    </WithTopPadding>
  )
}
