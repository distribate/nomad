import { action, type Action, type Ctx } from "@reatom/framework";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown";
import { Icon, type IconName } from "../ui/icon";
import { useCtx } from "@reatom/npm-solid-js";
import { For } from "solid-js";
import { $logout } from "../../lib/user/user.model";

type MoreEvent = {
  label: string;
  icon: IconName;
  withConfirm?: boolean;
};

type MoreAction = (ctx: Ctx, event: MoreEvent) => void;

const createActions = <
  T extends Record<string, MoreEvent & { action: MoreAction }>
>(events: T) => {
  return Object.fromEntries(
    Object.entries(events).map(([key, config]) => [
      key,
      {
        ...config,
        execute: action(
          (ctx: Ctx) => config.action(ctx, config),
          `${key}.cb`
        ),
      },
    ])
  ) as {
    [K in keyof T]: T[K] & {
      execute: Action<[], any>
    }
  };
};

const MORE_EVENTS = createActions({
  logout: {
    label: "Log out",
    icon: "sprite:arrow-left",
    withConfirm: true,
    action(ctx) {
      $logout.exec(ctx)
    },
  },
});

const executeEvent = (ctx: Ctx, name: keyof typeof MORE_EVENTS) => {
  MORE_EVENTS[name].execute(ctx);
};

export const MoreEvents = () => {
  const ctx = useCtx();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Icon name="sprite:dots-vertical" class="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <For each={Object.entries(MORE_EVENTS)}>
          {([name, event]) => (
            <DropdownMenuItem onSelect={() => executeEvent(ctx, name as keyof typeof MORE_EVENTS)}>
              <span>{event.label}</span>
            </DropdownMenuItem>
          )}
        </For>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
