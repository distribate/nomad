import { For, Show } from "solid-js"
import { useAtomAccessor } from "@/lib/helpers/reatom"
import { calcBottomHeight } from "../layout/bottom/model"
import { $header } from "../layout/header/model"
import { ChatMessage } from "./chat-message"
import { $chatFooter, $chatIsLoaded, $chatMsgs } from "./model"
import { Skeleton } from "@/shared/ui/skeleton"

const ChatMessagesSkeleton = () => {
  return (
    <For each={Array.from({ length: 16 })}>
      {(_) => <Skeleton class="w-full h-16" />}
    </For>
  )
}

const ChatMessages = () => {
  const msgs = useAtomAccessor($chatMsgs);
  const isLoaded = useAtomAccessor($chatIsLoaded);

  return (
    <Show when={isLoaded()} fallback={<ChatMessagesSkeleton />}>
      <For each={msgs()}>
        {(msg) => <ChatMessage {...msg} />}
      </For>
    </Show>
  )
}

export const ChatBody = () => {
  const footerHeight = useAtomAccessor($chatFooter.height);
  const heightHeight = useAtomAccessor($header.height);

  return (
    <div
      class="flex flex-col px-4 gap-1 w-full h-full flex-1 overflow-y-auto overflow-x-hidden"
      style={{
        "padding-bottom": calcBottomHeight(footerHeight()),
        "padding-top": `${heightHeight() + 16}px`
      }}
    >
      <ChatMessages />
    </div>
  )
}
