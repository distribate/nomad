import { For, onCleanup, onMount, Show, type Component, type ParentComponent } from "solid-js"
import { useCtx } from "@reatom/npm-solid-js";
import {
  $settings, currentSectionIsDefault,
  resetAccountForm, SETTINGS_SECTION_KEYS, DEFAULT_SETTINGS_NODE_KEY, useField, initFields, getSectionField,
  type SettingsSectionKey
} from "./model";
import { useAtomAccessor } from "@/lib/helpers/reatom";
import { Dynamic } from "solid-js/web";
import { $headerNodes } from "../layout/header/model";
import { BackButton } from "@/ui/back-button";
import { SettingsHeaderTitle, SettingsItem } from "./primitives";
import { action, atom, entries, withAssign, withReset } from "@reatom/framework";
import { WithTopPadding } from "../global/layouts";
import { $appState, LANGUAGES, $lang } from "@/lib/app/app.model";
import { $user, $logout } from "@/lib/user/user.model";
import { setupDevModule } from "@/lib/helpers";
import { Input } from "@/ui/input";
import { MeHeader } from "../me/primitives";
import { setLocale } from "@/paraglide/runtime";
import { translate } from "i18n";
import { $chats, $chatsFolders, $folderIsRemovable, createFolder, deleteFolder } from "../chats/model";
import { createMoreActions, MoreEvents } from "../global/more";
import toast from "solid-toast";
import { isError } from "utils/index";

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
                title: translate["settings.folders"]()
              },
              route: "folders"
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

const $newFolder = atom(null, "newFolder").pipe(
  withAssign((_, name) => ({
    title: atom("", `${name}.title`).pipe(withReset()),
    includedChats: atom<string[]>([], `${name}.includedChats`).pipe(withReset()),
    excludedChats: atom<string[]>([], `${name}.excludedChats`).pipe(withReset()),
  }))
)
const $isValidForSave = atom((ctx) => {
  if (ctx.spy($newFolder.title).trim().length >= 1) {
    return true;
  }
  return false;
})

const SettingsFoldersNewFolder = () => {
  const ctx = useCtx();

  onMount(() => {
    const sub = ctx.subscribe($isValidForSave, (state) => {
      if (state) {
        $headerNodes.update(ctx, {
          r: () => (
            <button
              class="text-sm! pointer-events-auto"
              onClick={() => {
                // todo: remove in future
                const chats = ctx.get($chats);
                const randomizedChatsIdx = chats.toSorted(() => Math.random() - 0.5).slice(0, 6).map(d => d.id)
                $newFolder.includedChats(ctx, randomizedChatsIdx)
                //

                createFolder(ctx, {
                  title: ctx.get($newFolder.title),
                  initialChats: {
                    included: ctx.get($newFolder.includedChats),
                    excluded: ctx.get($newFolder.excludedChats),
                  }
                });

                $settings.back(ctx)
              }}
            >
              Save
            </button>
          )
        })
      } else {
        $headerNodes.update(ctx, {
          r: null
        })
      }
    })

    onCleanup(() => {
      sub();

      $newFolder.title.reset(ctx);
      $newFolder.includedChats.reset(ctx);
      $newFolder.excludedChats.reset(ctx);
    })
  })

  const newFolderTitle = useAtomAccessor($newFolder.title)

  return (
    <>
      <SettingsSection title="Folder title">
        <Input
          variant="headless"
          borderVariant="headless"
          value={newFolderTitle()}
          maxLength={16}
          placeholder="Folder title"
          onInput={(e) => $newFolder.title(ctx, e.target.value)}
        />
      </SettingsSection>
      <SettingsSection title="Included Chats">
        <SettingsItem
          item={{
            type: "action",
            meta: {
              title: "Add Chats",
            },
            as: "button",
            event: action((ctx) => {
              console.log("add-chats")
            }),
          }}
        />
      </SettingsSection>
      <SettingsSection title="Excluded Chats">
        <SettingsItem
          item={{
            type: "action",
            meta: {
              title: "Add Chats to Exclude",
            },
            as: "button",
            event: action((ctx) => {
              console.log("add-chats-to-exclude")
            }),
          }}
        />
      </SettingsSection>
    </>
  )
}

const SettingsFolders = () => {
  const folders = useAtomAccessor($chatsFolders);

  return (
    <>
      <SettingsSection>
        <For each={folders()}>
          {(folder) => {
            const isRemovable = useAtomAccessor($folderIsRemovable(folder.id))

            return (
              <div class="flex items-center pr-2 justify-between w-full">
                <SettingsItem
                  item={{
                    type: "page",
                    meta: {
                      title: folder.title
                    },
                    route: folder.id.toString()
                  }}
                />
                <Show when={!isRemovable()}>
                  <MoreEvents
                    events={
                      createMoreActions({
                        delete: {
                          label: "Delete",
                          action: (ctx) => {
                            try {
                              deleteFolder(ctx, folder.id)
                            } catch (e) {
                              toast.error(isError(e) ? e.message : "Unknown error")
                            }
                          }
                        }
                      })
                    }
                  />
                </Show>
              </div>
            )
          }}
        </For>
      </SettingsSection>
      <SettingsSection>
        <SettingsItem
          item={{
            type: "page",
            meta: {
              title: "Create new Folder"
            },
            route: "new-folder"
          }}
        />
      </SettingsSection>
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
  [SETTINGS_SECTION_KEYS.FOLDERS]: SettingsFolders,
  [SETTINGS_SECTION_KEYS.NEWFOLDER]: SettingsFoldersNewFolder,
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
        c: () => <SettingsHeaderTitle title={getSectionField(state as SettingsSectionKey, "title")} />,
        r: () => <div class="w-10"></div>
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
