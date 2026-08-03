import { MeHeader } from "../me"
import { For, onCleanup, onMount, Show, type Component, type ParentComponent } from "solid-js"
import { useAtom, useCtx } from "@reatom/npm-solid-js";
import { $settings, currentSectionIsDefault, DEFAULT_SETTINGS_NODE_KEY } from "./model";
import { useAtomAccessor } from "../../../lib/reatom";
import { Dynamic } from "solid-js/web";
import { $headerNodes } from "../layout/header/model";
import { BackButton } from "../../ui/back-button";
import { SettingsItem } from "./primitives";
import { action, atom, entries, reatomMap, type AtomMut } from "@reatom/framework";
import { WithTopPadding } from "../layouts";
import { $locale, $localeLabel, LOCALES } from "../../../lib/app/app.model";
import { $user, $logout } from "../../../lib/user/user.model";
import { setupDevModule } from "../../../lib/helpers";
import { Input } from "../../ui/input";
import { withLog } from "../../../lib/reatom/extensions";
import { Button } from "../../ui/button";

const SettingsSection: ParentComponent = (props) => {
  return (
    <section class="flex bg-neutral-800 rounded-xl overflow-hidden flex-col gap-2" {...props} />
  )
}

type AccountField = "firstName" | "photo";

export const $accountFieldsMap = reatomMap<AccountField, AtomMut<string>>(
  new Map(), "accountFields"
).pipe(
  withLog()
);

export const getFieldAtom = action((ctx, fieldName: AccountField, initialValue = "") => {
  const map = ctx.get($accountFieldsMap);

  if (map.has(fieldName)) {
    return map.get(fieldName)!;
  }

  const $field = atom(initialValue, `accountField.${fieldName}`);
  $accountFieldsMap.set(ctx, fieldName, $field);

  return $field;
}, "getFieldAtom");

export const resetAccountForm = action((ctx) => {
  $accountFieldsMap.clear(ctx);
}, "resetAccountForm");

function useField(name: AccountField, initialValue = "") {
  const ctx = useCtx();
  const $field = getFieldAtom(ctx, name, initialValue);

  const value = useAtomAccessor($field);
  const onChange = (newValue: string) => $field(ctx, newValue);

  return [value, onChange] as const;
}

const SETTINGS_COMPONENTS: Record<string, Component> = {
  "default": () => {
    const currLang = useAtomAccessor($localeLabel);
    const me = useAtomAccessor($user.data);

    return (
      <>
        <Show when={me()}>
          {(data) => <MeHeader me={data()} />}
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
  "language": () => {
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
  "account": () => {
    const ctx = useCtx();

    const [firstName, setFirstName] = useField("firstName");
    const [photo, setPhoto] = useField("photo");

    onMount(() => {
      const curr = ctx.get($user.data)!;

      setFirstName(curr.firstName);
      setPhoto(curr.photo?.src);
    });

    onCleanup(() => {
      resetAccountForm(ctx);
    });

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

export const Settings = () => {
  const ctx = useCtx();
  const currSection = useAtomAccessor($settings.currentSection);

  setupDevModule(
    ctx, () => import("./model.dev"), (m) => m.$settingsDev, { persistent: true }
  )

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
