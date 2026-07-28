import { action, atom, withInit, type Action } from "@reatom/framework"
import { MeHeader } from "../me"
import { useAtomAccessor } from "../../../lib/reatom"
import { For, Match, Show, Switch } from "solid-js"
import { navigate } from "../../../lib/router/utils";
import { useCtx } from "@reatom/npm-solid-js";

type SettingMeta = {
  title: string;
  description?: string;
};

type SettingItem =
  | {
    type: "page";
    meta: SettingMeta;
    route: string;
  }
  | {
    type: "action";
    meta: SettingMeta;
    event: Action<[], void>;
  }
  | {
    type: "group";
    meta: SettingMeta;
    children: Record<string, SettingItem>;
  };

type SettingsSection = {
  title?: string;
  children: Record<string, SettingItem>;
};

type Settings = Record<string, SettingsSection>;

const defineSettings = action((ctx): Settings => {
  return {
    main: {
      children: {
        account: {
          type: "page",
          meta: {
            title: "Account",
            description: "Username, Bio",
          },
          route: "/settings/account",
        },
        privacy: {
          type: "page",
          meta: {
            title: "Privacy",
            description: "Devices",
          },
          route: "/settings/privacy",
        },
      },
    },
    help: {
      title: "Help",
      children: {
        faq: {
          type: "page",
          meta: {
            title: "FAQ",
          },
          route: "/settings/faq",
        },
      },
    },
  }
})

const $settings = atom<Settings>({}, "settings").pipe(
  withInit((ctx) => defineSettings(ctx))
)

const SettingsAction = (props: {
  item: Extract<SettingItem, { type: "action" }>;
}) => {
  const ctx = useCtx();

  return (
    <button
      class="
        flex items-center
        w-full
        px-4 py-3
      "
      onClick={() => props.item.event(ctx)}
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

const SettingsLink = (props: {
  item: Extract<SettingItem, {
    type: "page"
  }>;
}) => {
  const ctx = useCtx();

  return (
    <button
      class="
        flex items-center
        justify-between
        w-full
        px-4 py-3
        hover:bg-neutral-700
      "
      onClick={() => navigate(ctx, props.item.route)}
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

const SettingsItem = (props: {
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

const SettingsSection = (props: {
  section: SettingsSection;
}) => {
  return (
    <section class="flex bg-neutral-800 rounded-xl flex-col gap-2">
      {props.section.title && (
        <h2 class="px-4 pt-2 text-sm text-neutral-400">
          {props.section.title}
        </h2>
      )}
      <div class="rounded-xl overflow-hidden">
        <For each={Object.entries(props.section.children)}>
          {([key, item]) => (
            <SettingsItem
              item={item}
            />
          )}
        </For>
      </div>
    </section>
  );
};

const SettingsPage = (props: {
  settings: Settings;
}) => {
  return (
    <div class="flex flex-col gap-6">
      <For each={Object.entries(props.settings)}>
        {([key, section]) => (
          <SettingsSection
            section={section}
          />
        )}
      </For>
    </div>
  );
};

export const Settings = () => {
  const settings = useAtomAccessor($settings)

  return (
    <div class="flex flex-col h-full w-full gap-4 p-4">
      <MeHeader />
      <SettingsPage settings={settings()} />
    </div>
  )
}
