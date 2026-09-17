import { getDayjs } from "@/lib/dayjs";
import type { Chat } from "./types"
import { navigate } from "router/utils";
import { action } from "@reatom/framework";
import { useCtx } from "@reatom/npm-solid-js";

type ChatsItemProps = Chat;

const toChat = action((ctx, chatId: string) => {
  navigate(`/chat/${chatId}`)
})

export const ChatsItem = (props: ChatsItemProps) => {
  const ctx = useCtx();
  const dayjs = getDayjs();

  return (
    <div
      class="flex gap-2 active:bg-neutral-800 h-18 py-3 px-4 w-full items-center"
      onClick={() => toChat(ctx, props.id)}
    >
      <div class="relative w-12 h-12 aspect-square">
        <img
          src={props.avatar}
          alt=""
          loading="eager"
          class="w-full h-full rounded-full object-cover"
        />
      </div>
      <div class="flex flex-col h-10 w-full overflow-hidden h-full">
        <div class="flex flex-col w-full">
          <div class="flex items-center w-full justify-between">
            <span class="text-sm">{props.username}</span>
            <span class="text-xs text-neutral-400 line-clamp-1">
              {dayjs(props.lastMessage.timestamp).format("HH:mm")}
            </span>
          </div>
          <span class="text-sm line-clamp-1">
            {props.lastMessage.text}
          </span>
        </div>
      </div>
    </div>
  )
}
