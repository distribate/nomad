import type { ChatMessage as ChatMessageType } from "../chats/types"

export const ChatMessage = (props: ChatMessageType) => {
  return (
    <div class="flex rounded-xl bg-neutral-800 w-fit p-2 h-fit">
      <span>
        {props.text}
      </span>
    </div>
  )
}
