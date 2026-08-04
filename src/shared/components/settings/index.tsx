import { For, onCleanup, onMount, Show, type Component, type ParentComponent } from "solid-js"
import { useCtx } from "@reatom/npm-solid-js";
import {
  $settings, currentSectionIsDefault,
  resetAccountForm, SETTINGS_SECTION_KEYS, DEFAULT_SETTINGS_NODE_KEY, useField,
  initFields,
  getCurrentSectionTitle
} from "./model";
import { useAtomAccessor } from "../../../lib/reatom";
import { Dynamic } from "solid-js/web";
import { $headerNodes } from "../layout/header/model";
import { BackButton } from "../../ui/back-button";
import { SettingsItem } from "./primitives";
import { action, entries } from "@reatom/framework";
import { WithTopPadding } from "../global/layouts";
import { $appState, $langLabel, LANGUAGES, $lang } from "../../../lib/app/app.model";
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

const SETTINGS_COMPONENTS: Record<string, Component> = {
  [SETTINGS_SECTION_KEYS.DEFAULT]: () => {
    const currLang = useAtomAccessor($langLabel);
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
                  title: translate["settings.account"](),
                  description: "Username, Bio"
                },
                route: "account"
              }}
            />
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: translate["settings.privacy"](),
                  description: "Devices, Passkeys"
                },
                route: "privacy"
              }}
            />
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: translate["settings.preferences"](),
                  description: "Animations"
                },
                route: "preferences"
              }}
            />
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: translate["settings.language"](),
                  description: currLang()
                },
                route: "language"
              }}
            />
          </SettingsSection>
          <SettingsSection title={translate["settings.help"]()}>
            <SettingsItem
              item={{
                type: "page",
                meta: {
                  title: translate["settings.ask-question"]()
                },
                route: "ask"
              }}
            />
          </SettingsSection>
        </div>
      </>
    )
  },
  [SETTINGS_SECTION_KEYS.PREFERENCES]: () => {
    return (
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
    )
  },
  [SETTINGS_SECTION_KEYS.LANGUAGE]: () => {
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
  },
  [SETTINGS_SECTION_KEYS.ACCOUNT]: () => {
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
            value={firstName()}
            onInput={(e) => setFirstName(e.target.value)}
          />
        </SettingsSection>
        <SettingsSection>
          <Input
            variant="headless"
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
}

const SettingsHeaderTitle = (props: { title: string }) => {
  return (
    <span class="text-left font-semibold text-primary">{props.title}</span>
  )
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
        c: () => <SettingsHeaderTitle title={getCurrentSectionTitle(state)} />
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
