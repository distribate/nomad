import { useAtomAccessor } from "@/lib/helpers/reatom"
import { For } from "solid-js"
import { ChatsItem } from "./chats-item";
import { $displayedChats } from "./model";
import { $bottom, calcBottomHeight } from "../layout/bottom/model";
import { ChatsFolders } from "./chats-folders";

export const ChatsList = () => {
  const chats = useAtomAccessor($displayedChats);
  const bottomHeight = useAtomAccessor($bottom.height)

  return (
    <div
      class="flex flex-col w-full h-full overflow-y-auto overflow-x-hidden"
      style={{
        "padding-bottom": calcBottomHeight(bottomHeight()),
      }}
    >
      <ChatsFolders />
      <For each={chats()}>
        {(chat) => <ChatsItem {...chat} />}
      </For>
    </div>
  )
}
