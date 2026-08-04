import { Show } from "solid-js";
import type { User } from "../../../lib/user/user.model";
import { Icon } from "../../ui/icon";

type MeHeaderAvatarProps =
  | { as: "editable", onPick: (url: string) => void, previewImg: string }
  | { as: "readonly", photo: Pick<User, "photo">["photo"], alt?: string }

const MeHeaderAvatar = (props: MeHeaderAvatarProps) => {
  const Component = () => {
    if (props.as === "editable") {
      let inputRef!: HTMLInputElement;

      return (
        <div class="relative w-full h-full">
          <img
            src={props.previewImg}
            alt=""
            class="w-full h-full object-cover rounded-full"
          />
          <button
            class="absolute cursor-pointer h-8 aspect-square bottom-0 right-0 bg-brand-default rounded-full flex items-center justify-center"
            onClick={() => inputRef.click()}
          >
            <Icon name="sprite:camera" class="size-5" />
          </button>
          <input
            type="file"
            ref={inputRef}
            class="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  props.onPick(e.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      )
    }

    if (props.as === 'readonly') {
      return (
        <Show
          when={props.photo?.src}
          fallback={
            <span class="text-bold text-lg">{props.alt?.[0] ?? " "}</span>
          }
        >
          {(data) => (
            <img
              src={data()}
              alt={props.alt}
              class="w-full h-full object-cover rounded-full"
            />
          )}
        </Show>
      )
    }

    return null;
  }

  return (
    <div class="flex h-26 aspect-square">
      <Component />
    </div>
  )
}

type MeHeaderProps = {
  me: User,
  avatar: MeHeaderAvatarProps
};

export const MeHeader = (props: MeHeaderProps) => {
  return (
    <div class="flex flex-col gap-2 items-center justify-center w-full">
      <MeHeaderAvatar {...props.avatar} />
      <div class="flex flex-col items-center justify-center w-full">
        <p class="font-semibold text-base">
          {props.me.firstName}
        </p>
        <p class="text-neutral-400 text-sm">online</p>
      </div>
    </div>
  )
}
