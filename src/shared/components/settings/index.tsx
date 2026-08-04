import { For, onCleanup, onMount, Show, type Component, type ParentComponent } from "solid-js"
import { useCtx } from "@reatom/npm-solid-js";
import {
  $settings, currentSectionIsDefault,
  resetAccountForm, SETTINGS_SECTION_KEYS, DEFAULT_SETTINGS_NODE_KEY, useField,
  initFields,
  getSectionField,
  type SettingsSectionKey
} from "./model";
import { useAtomAccessor } from "../../../lib/reatom";
import { Dynamic } from "solid-js/web";
import { $headerNodes } from "../layout/header/model";
import { BackButton } from "../../ui/back-button";
import { SettingsHeaderTitle, SettingsItem } from "./primitives";
import { action, entries } from "@reatom/framework";
import { WithTopPadding } from "../global/layouts";
import { $appState, LANGUAGES, $lang } from "../../../lib/app/app.model";
import { $user, $logout } from "../../../lib/user/user.model";
import { setupDevModule } from "../../../lib/helpers";
import { Input } from "../../ui/input";
import { MeHeader } from "../me/primitives";
import { setLocale } from "../../../paraglide/runtime";
import { translate } from "../../../lib/app/locale";

const SettingsSection: ParentComponent<{ title?: string }> = (props) => {
  return (
    <section class="flex bg-neutral-800 py-1 rounded-xl overflow-hidden flex-col gap-2">
      {props.title && (
        <h2 class="px-4 text-brand-default pt-2 text-sm text-neutral-400">
          {props.title}
        </h2>
      )}
      {props.children}
    </section>
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

const SettingsAccount = () => {
  const [firstName, setFirstName] = useField("firstName");
  const [bio, setBio] = useField("bio");
  const [style, setStyle] = useField("style");
  const [interests, setInterests] = useField("interests");
  const [age, setAge] = useField("age");

  return (
    <>
      <SettingsSection title={translate["shared.your-name"]()}>
        <Input
          variant="headless"
          borderVariant="headless"
          value={firstName()}
          onInput={(e) => setFirstName(e.target.value)}
        />
      </SettingsSection>
      <SettingsSection>
        <Input
          variant="headless"
          borderVariant="headless"
          value={bio()}
          placeholder={translate["shared.bio"]()}
          onInput={(e) => setBio(e.target.value)}
        />
      </SettingsSection>
      <SettingsSection title={translate["shared.about-you"]()}>
        <div class="flex flex-col pt-2 pb-1 *:px-4 w-full h-full gap-4">
          <div>
            <p>
              {translate["shared.interests"]()}
            </p>
            <div class="flex flex-wrap w-full gap-2">
              <For each={interests().split(",")}>
                {(interest) => (
                  <div>{interest}</div>
                )}
              </For>
            </div>
          </div>
          <div class="flex items-center w-full gap-2">
            <p>
              {translate["shared.style"]()}
            </p>
            <SettingsItem
              item={{
                type: "action",
                meta: {
                  title: style() ?? translate["shared.not-selected"]()
                },
                as: "button",
                event: action((ctx) => { }),
              }}
            />
          </div>
        </div>
      </SettingsSection>
      <SettingsSection>
        <SettingsItem
          item={{
            type: "action",
            meta: {
              title: translate["shared.logout"]()
            },
            as: "button",
            event: action((ctx) => $logout.exec(ctx)),
            class: "text-red-500"
          }}
        />
      </SettingsSection>
    </>
  )
}
const SettingsLanguage = () => {
  return (
    <SettingsSection title="Language">
      <div class="flex flex-col">
        <For each={entries(LANGUAGES)}>
          {([lang, value]) => {
            return (
              <SettingsItem
                item={{
                  type: "action",
                  meta: {
                    title: value.label,
                    description: value.label
                  },
                  event: action(() => setLocale(lang)),
                  as: "button",
                  isActive: lang === useAtomAccessor($lang)()
                }}
              />
            )
          }}
        </For>
      </div>
    </SettingsSection>
  )
}
const SettingsPreferences = () => {
  return (
    <SettingsSection>
      <SettingsItem
        item={{
          type: "action",
          meta: {
            title: translate["settings.preferences_.childs.animations.label"](),
          },
          event: action((ctx, c) => $settings.preferences.animations(ctx, c)),
          as: "switch",
          value: $settings.preferences.animations
        }}
      />
    </SettingsSection>
  )
}
const SettingsPrivacy = () => {
  return (
    <>
      <SettingsSection title="Security">
        <SettingsItem
          item={{
            type: "page",
            meta: {
              title: translate["settings.passcode"]()
            },
            route: "passcode"
          }}
        />
        <SettingsItem
          item={{
            type: "page",
            meta: {
              title: translate["settings.devices"]()
            },
            route: "devices"
          }}
        />
      </SettingsSection>
    </>
  )
}
const SettingsPasscode = () => {
  return (
    <div class="flex flex-col w-full h-full gap-4 items-center justify-center">
      <div class="flex text-center flex-col gap-1 w-full items-center justify-center">
        <p class="font-semibold">
          Enter your passcode
        </p>
        <p class="text-neutral-400 text-sm">
          Please enter your current Nomad passcode <br /> to manage this setting
        </p>
      </div>
      <div>
        <Input
          type="password"
          borderVariant="default"
          variant="headless"
          maxLength={4}
        />
      </div>
    </div>
  )
}

const SettingsDefault = () => {
  const me = useAtomAccessor($user.data);
  const [photo, setPhoto] = useField("photo");
  const ctx = useCtx();

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
                title: translate["settings.account"](),
                description: getSectionField("account", "description")
              },
              route: "account"
            }}
          />
          <SettingsItem
            item={{
              type: "page",
              meta: {
                title: translate["settings.privacy"](),
                description: getSectionField("privacy", "description")
              },
              route: "privacy"
            }}
          />
          <SettingsItem
            item={{
              type: "page",
              meta: {
                title: translate["settings.preferences"](),
                description: getSectionField("preferences", "description")
              },
              route: "preferences"
            }}
          />
          <SettingsItem
            item={{
              type: "page",
              meta: {
                title: translate["settings.language"](),
                description: getSectionField(ctx, "language", "description")
              },
              route: "language"
            }}
          />
        </SettingsSection>
        <SettingsSection title={translate["settings.help"]()}>
          <SettingsItem
            item={{
              type: "action",
              meta: {
                title: translate["settings.ask-question"]()
              },
              as: "button",
              event: action((ctx) => {
                console.log("")
              })
            }}
          />
        </SettingsSection>
      </div>
    </>
  )
}

const SETTINGS_COMPONENTS: Record<string, Component> = {
  [SETTINGS_SECTION_KEYS.DEFAULT]: SettingsDefault,
  [SETTINGS_SECTION_KEYS.PREFERENCES]: SettingsPreferences,
  [SETTINGS_SECTION_KEYS.LANGUAGE]: SettingsLanguage,
  [SETTINGS_SECTION_KEYS.ACCOUNT]: SettingsAccount,
  [SETTINGS_SECTION_KEYS.PRIVACY]: SettingsPrivacy,
  [SETTINGS_SECTION_KEYS.PASSCODE]: SettingsPasscode,
}

export const SettingsLayout: ParentComponent = (props) => {
  const ctx = useCtx();

  // todo: migrate to more declarative control of the backbutton
  onMount(() => {
    const unsub = ctx.subscribe($settings.currentSection, (state) => {
      if (currentSectionIsDefault(state)) {
        $headerNodes.update(ctx, {
          l: null,
          c: null
        })
        return;
      }

      $headerNodes.update(ctx, {
        l: () => <BackButton onClick={() => $settings.back(ctx)} />,
        c: () => <SettingsHeaderTitle title={getSectionField(state as SettingsSectionKey, "title")} />
      }, {
        withSnapshot: false
      })
    });

    onCleanup(unsub);
  });

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
