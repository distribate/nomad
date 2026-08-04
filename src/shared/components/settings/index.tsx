import { For, onCleanup, onMount, Show, type Component, type ParentComponent } from "solid-js"
import { useCtx } from "@reatom/npm-solid-js";
import {
  $settings, currentSectionIsDefault,
  resetAccountForm, SETTINGS_SECTION_KEYS, DEFAULT_SETTINGS_NODE_KEY, useField,
  initFields
} from "./model";
import { useAtomAccessor } from "../../../lib/reatom";
import { Dynamic } from "solid-js/web";
import { $headerNodes } from "../layout/header/model";
import { BackButton } from "../../ui/back-button";
import { SettingsItem } from "./primitives";
import { action, entries } from "@reatom/framework";
import { WithTopPadding } from "../global/layouts";
import { $appState, $locale, $localeLabel, LOCALES } from "../../../lib/app/app.model";
import { $user, $logout } from "../../../lib/user/user.model";
import { setupDevModule } from "../../../lib/helpers";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { MeHeader } from "../me/primitives";

const SettingsSection: ParentComponent = (props) => {
  return (
    <section class="flex bg-neutral-800 rounded-xl overflow-hidden flex-col gap-2" {...props} />
  )
}

const SettingsAppMeta = () => {
  const version = useAtomAccessor($appState.version);
  const type = useAtomAccessor($appState.type);

  return (
    <div class="flex flex-col w-full items-center justify-center">
      <p class="text-neutral-400 text-sm font-medium">
        Nomad v{version()} ({type()})
      </p>
    </div>
  )
}

const SETTINGS_COMPONENTS: Record<string, Component> = {
  [SETTINGS_SECTION_KEYS.DEFAULT]: () => {
    const currLang = useAtomAccessor($localeLabel);
    const me = useAtomAccessor($user.data);
    const [photo, setPhoto] = useField("photo");

    return (
      <>
        <Show when={me()}>
          {(data) => (
            <MeHeader
              me={data()}
              avatar={{
                as: "editable",
                onPick: (value) => {
                  setPhoto(value);
                },
                previewImg: photo()
              }}
            />
          )}
        </Show>
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
                  description: "Devices, Passkeys"
                },
                route: "privacy"
              }}
            />
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: "Preferences",
                  description: "Animations"
                },
                route: "preferences"
              }}
            />
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: "Language",
                  description: currLang()
                },
                route: "language"
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
            {/*<SettingsItem
              item={{
                type: "page",
                meta: {
                  title: "FAQ"
                },
                route: "faq"
              }}
            />*/}
          </SettingsSection>
        </div>
      </>
    )
  },
  [SETTINGS_SECTION_KEYS.PREFERENCES]: () => {
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
  [SETTINGS_SECTION_KEYS.LANGUAGE]: () => {
    return (
      <>
        <div class="flex flex-col gap-6">
          <SettingsSection>
            <h2 class="px-4 pt-2 text-sm text-neutral-400">
              Language
            </h2>
            <div class="flex flex-col">
              <For each={entries(LOCALES)}>
                {([locale, value]) => {
                  return (
                    <SettingsItem
                      item={{
                        type: "action",
                        meta: {
                          title: value.label,
                          description: value.label
                        },
                        event: action((ctx) => {
                          $locale(ctx, locale)
                          window.location.reload();
                        }),
                        as: "button",
                        isActive: locale === useAtomAccessor($locale)()
                      }}
                    />
                  )
                }}
              </For>
            </div>
          </SettingsSection>
        </div>
      </>
    )
  },
  [SETTINGS_SECTION_KEYS.ACCOUNT]: () => {
    const ctx = useCtx();
    const [firstName, setFirstName] = useField("firstName");

    return (
      <>
        <div class="flex flex-col gap-6">
          <SettingsSection>
            <Input
              value={firstName()}
              onInput={(e) => setFirstName(e.target.value)}
            />
          </SettingsSection>
          <SettingsSection>
            <Button onClick={() => $logout.exec(ctx)}>
              Log out
            </Button>
          </SettingsSection>
        </div>
      </>
    )
  }
}

export const SettingsLayout: ParentComponent = (props) => {
  const ctx = useCtx();

  setupDevModule(
    ctx, () => import("./model.dev"), (m) => m.$settingsDev
  )

  return (
    <WithTopPadding class="flex flex-col h-full w-full gap-4 px-4">
      {props.children}
    </WithTopPadding>
  )
}

const SettingsNotFound = () => {
  return (
    <div class="flex flex-col h-screen items-center justify-center w-full gap-4 p-4">
      Не найдено
    </div>
  )
}

const getComponent = () => {
  const currSection = useAtomAccessor($settings.currentSection);
  const section = currSection();

  const key = currentSectionIsDefault(section)
    ? DEFAULT_SETTINGS_NODE_KEY
    : section;

  return SETTINGS_COMPONENTS[key] ?? null;
};

export const SettingsPage = () => {
  const ctx = useCtx();

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

  initFields(ctx);

  onCleanup(() => {
    resetAccountForm(ctx);
  });

  return (
    <div class="flex flex-col gap-6 justify-between w-full h-full">
      <div class="flex flex-col gap-4 overflow-y-auto w-full h-full">
        <Dynamic component={getComponent() ?? SettingsNotFound} />
      </div>
      <SettingsAppMeta />
    </div>
  )
}
