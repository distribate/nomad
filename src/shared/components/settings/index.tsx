import { MeHeader } from "../me"
import { onCleanup, onMount, Show, type Component, type ParentComponent } from "solid-js"
import { useCtx } from "@reatom/npm-solid-js";
import { $settings, currentSectionIsDefault, DEFAULT_SETTINGS_NODE_KEY } from "./model";
import { useAtomAccessor } from "../../../lib/reatom";
import { Dynamic } from "solid-js/web";
import { $headerNodes } from "../layout/header/model";
import { BackButton } from "../../ui/back-button";
import { SettingsItem } from "./primitives";
import { action } from "@reatom/framework";
import { WithTopPadding } from "../layouts";

const SettingsSection: ParentComponent = (props) => {
  return (
    <section class="flex bg-neutral-800 rounded-xl overflow-hidden flex-col gap-2" {...props} />
  )
}

const SETTINGS_COMPONENTS: Record<string, Component> = {
  "default": () => {
    return (
      <>
        <MeHeader />
        <div class="flex flex-col gap-6">
          <SettingsSection>
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: "Account",
                  description: "Username, Bio"
                },
                route: "account"
              }}
            />
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: "Privacy",
                  description: ""
                },
                route: "privacy"
              }}
            />
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: "Preferences",
                  description: ""
                },
                route: "preferences"
              }}
            />
          </SettingsSection>
          <SettingsSection>
            <h2 class="px-4 pt-2 text-sm text-neutral-400">
              Help
            </h2>
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: "Ask a Question"
                },
                route: "ask"
              }}
            />
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: "FAQ"
                },
                route: "faq"
              }}
            />
          </SettingsSection>
        </div>
      </>
    )
  },
  "preferences": () => {
    return (
      <>
        <div class="flex flex-col gap-6">
          <SettingsSection>
            <SettingsItem
              item={{
                type: "action",
                meta: {
                  title: "Animations",
                  description: ""
                },
                event: action((ctx, c) => $settings.preferences.animations(ctx, c)),
                as: "switch",
                value: $settings.preferences.animations
              }}
            />
          </SettingsSection>
        </div>
      </>
    )
  },
  "account": () => {
    return (
      <>
        <div class="flex flex-col gap-6">
          <SettingsSection>

          </SettingsSection>
        </div>
      </>
    )
  }
}

export const Settings = () => {
  const ctx = useCtx();

  const currSection = useAtomAccessor($settings.currentSection);

  const ComponentToRender = () => {
    const section = currSection();
    const key = currentSectionIsDefault(section) ? DEFAULT_SETTINGS_NODE_KEY : section;
    return SETTINGS_COMPONENTS[key] ?? null;
  };

  // todo: migrate to more declarative control of the backbutton
  onMount(() => {
    const unsub = ctx.subscribe($settings.currentSection, (state) => {
      if (currentSectionIsDefault(state)) {
        $headerNodes.update(ctx, {
          l: null
        })
        return;
      }

      $headerNodes.update(ctx, {
        l: () => <BackButton onClick={() => $settings.back(ctx)} />
      }, { withSnapshot: false })
    });

    onCleanup(() => unsub());
  });

  return (
    <WithTopPadding class="flex flex-col h-full w-full gap-4 px-4">
      <Show
        when={ComponentToRender()}
        fallback={
          <div class="flex flex-col h-screen items-center justify-center w-full gap-4 p-4">
            Не найдено
          </div>
        }
      >
        {(Comp) => (
          <div class="flex overflow-y-auto flex-col gap-6 w-full h-full">
            {/*@ts-ignore*/}
            <Dynamic component={Comp} />
          </div>
        )}
      </Show>
    </WithTopPadding>
  )
}
