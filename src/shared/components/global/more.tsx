import { action, type Action, type Ctx } from "@reatom/framework";
import { useCtx } from "@reatom/npm-solid-js";
import { For } from "solid-js";
import { Icon, type IconName } from "@/ui/icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown";
import cn from "cnfast";

type MoreEvent = {
  label: string
  icon?: IconName
  withConfirm?: boolean,
  disabled?: boolean,
  as?: "click" | "select"
}

type MoreActionItem = MoreEvent & {
  action: (ctx: Ctx, event: MoreEvent & { name: string }) => void
}

type MoreActions<T extends Record<string, MoreActionItem>> = {
  [K in keyof T]: T[K] & {
    execute: Action<[], void>
  }
}

export const createMoreActions = <
  T extends Record<string, MoreActionItem>,
>(events: T): MoreActions<T> => {
  return Object.fromEntries(
    Object.entries(events).map(([name, config]) => [
      name,
      {
        ...config,
        as: config.as ?? "select",
        execute: action(
          (ctx: Ctx) => config.action(ctx, { ...config, name }),
          `${name}.cb`,
        ),
      },
    ]),
  ) as MoreActions<T>
}

type MoreEventsProps<T extends Record<string, MoreActionItem>> = {
  class?: string
  disabled?: boolean
  events: MoreActions<T>
}

export const MoreEvents = <
  T extends Record<string, MoreActionItem>,
>(props: MoreEventsProps<T>) => {
  const ctx = useCtx()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        class={cn(
          "disabled:opacity-50 pointer-events-auto disabled:pointer-events-none",
          props.class,
        )}
        disabled={props.disabled}
      >
        <Icon name="sprite:dots-vertical" class="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <For each={Object.entries(props.events)}>
          {([name, event]) => {
            return (
              <DropdownMenuItem
                disabled={event.disabled}
                closeOnSelect={event.as !== "click"}
                onSelect={() => {
                  event.execute(ctx, { ...event, name })
                }}
              >
                {event.icon && <Icon name={event.icon} />}
                <span>{event.label}</span>
              </DropdownMenuItem>
            )
          }}
        </For>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
