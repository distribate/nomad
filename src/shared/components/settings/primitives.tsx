import { useCtx } from "@reatom/npm-solid-js";
import { $settings } from "./model";
import { Match, Show } from "solid-js";
import { Switch } from "solid-js";
import { SwitchControl, Switch as SwitchPrimitive, SwitchThumb } from "../../ui/switch"
import { useAtomAccessor } from "../../../lib/reatom";
import type { SettingItem } from "./types";

export const SettingsAction = (props: { item: Extract<SettingItem, { type: "action" }> }) => {
  const ctx = useCtx();

  const { item } = props;

  if (item.as === 'switch') {
    const checked = useAtomAccessor(item.value);

    return (
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col text-left">
          <span>
            {item.meta.title}
          </span>
          <Show when={props.item.meta.description}>
            <span class="text-sm text-neutral-400">
              {item.meta.description}
            </span>
          </Show>
        </div>
        <SwitchPrimitive
          checked={checked()}
          onChange={(state) => item.event(ctx, state)}
        >
          <SwitchControl>
            <SwitchThumb />
          </SwitchControl>
        </SwitchPrimitive>
      </div>
    )
  }

  if (item.as === 'button') {
    return (
      <button
        class="flex items-center w-full px-4 py-3"
        onClick={() => item.event(ctx)}
      >
        <div class="flex flex-col text-left">
          <span>
            {item.meta.title}
          </span>
          <Show when={item.meta.description}>
            <span class="text-sm text-neutral-400">
              {item.meta.description}
            </span>
          </Show>
        </div>
      </button>
    )
  }
};

export const SettingsLink = (props: { item: Extract<SettingItem, { type: "page" }> }) => {
  const ctx = useCtx();

  return (
    <button
      class="flex items-center justify-between w-full px-4 py-3 hover:bg-neutral-700"
      onClick={() => $settings.to(ctx, props.item.route)}
    >
      <div class="flex flex-col text-left">
        <span>
          {props.item.meta.title}
        </span>
        <Show when={props.item.meta.description}>
          <span class="text-sm text-neutral-400">
            {props.item.meta.description}
          </span>
        </Show>
      </div>
    </button>
  );
};

export const SettingsItem = (props: {
  item: SettingItem;
}) => {
  return (
    <Switch>
      <Match when={props.item.type === "page"}>
        <SettingsLink
          // @ts-expect-error
          item={props.item}
        />
      </Match>
      <Match when={props.item.type === "action"}>
        <SettingsAction
          // @ts-expect-error
          item={props.item}
        />
      </Match>
    </Switch>
  );
};
