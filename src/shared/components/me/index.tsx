import { useCtx } from "@reatom/npm-solid-js";
import { useAtomAccessor } from "../../../lib/reatom"
import { $user, type User } from "../../../lib/user/user.model"
import { Button } from "../../ui/button";
import { For, Show, type Accessor } from "solid-js";
import { action, isAbort, type Action } from "@reatom/framework";
import { navigate } from "../../../lib/router/utils";
import { Icon, type IconName } from "../../ui/icon";

export const MeHeader = () => {
  const me = useAtomAccessor($user.data) as Accessor<User>;

  return (
    <div class="flex flex-col gap-2 items-center justify-center w-full">
      <div class="flex h-26 aspect-square">
        <Show
          when={me()?.photo?.src}
          fallback={
            <span class="text-bold text-lg">{me().firstName?.[0] ?? " "}</span>
          }
        >
          {(data) => (
            <img
              src={data()}
              alt={me().firstName}
              class="w-full h-full object-cover rounded-full"
            />
          )}
        </Show>
      </div>
      <div class="flex flex-col items-center justify-center w-full">
        <p class="font-semibold text-base">
          {me().firstName}
        </p>
        <p class="text-neutral-400 text-sm">online</p>
      </div>
    </div>
  )
}

type MeEvent = {
  icon: IconName,
  label: string,
  action: Action<[], any>
}

const ME_EVENTS: MeEvent[] = [
  {
    label: "Set Photo",
    action: action(async (ctx) => {
      if ('showOpenFilePicker' in window) {
        try {
           // @ts-expect-error
          const [fileHandle] = await window.showOpenFilePicker({
            types: [
              {
                description: 'Media',
                accept: {
                  'image/*': ['.png', '.jpeg', '.jpg', '.webp'],
                  'video/*': ['.mp4', '.mov', '.webm']
                }
              }
            ],
            multiple: false
          });

          const file = await fileHandle.getFile();
          console.log('Выбран файл:', file);
        } catch (e) {
          if (!isAbort(e)) {
            console.error(e);
          }
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';

        input.onchange = () => {
          if (!input.files) return;

          if (input.files.length > 0) {
            console.log('Выбран файл:', input.files[0]);
          }
        };

        input.click();
      }
    }),
    icon: "sprite:photo-edit"
  },
  {
    label: "Edit Info",
    action: action(async (ctx) => {
      await navigate("/settings", { a: "edit-info" })
    }),
    icon: "sprite:edit"
  },
  {
    label: "Settings",
    action: action(async (ctx) => {
      await navigate("/settings")
    }),
    icon: "sprite:settings"
  },
]

const MeEvents = () => {
  const ctx = useCtx()

  return (
    <div class="flex h-14 *:h-full *:w-1/3 gap-2 w-full items-center justify-between">
      <For each={ME_EVENTS}>
        {(data) => (
          <Button
            variant="neutral"
            onClick={() => data.action(ctx)}
            class="flex flex-col"
          >
            <Icon name={data.icon} class="size-6" />
            <span class="leading-3 text-[13px]">
              {data.label}
            </span>
          </Button>
        )}
      </For>
    </div>
  )
}

export const Me = () => {
  return (
    <div class="flex flex-col h-full w-full gap-4 p-4">
      <MeHeader />
      <MeEvents />
    </div>
  )
}
