import { onCleanup, onMount } from "solid-js";
import { useCtx } from "@reatom/npm-solid-js";
import { setupDevModule } from "@/lib/helpers";
import { ChatHeader } from "./chat-header";
import { ChatBody } from "./chat-body";
import { ChatFooter } from "./chat-footer";
import { navigate } from "@/lib/router/utils";
import { tinykeys } from "tinykeys"

const bindListeners = (ref: HTMLDivElement) => tinykeys(ref, {
  "Escape": () => {
    navigate("/");
  },
})

export const Chat = () => {
  const ctx = useCtx();

  let ref!: HTMLDivElement;

  setupDevModule(ctx, () => import("./model.dev"), (m) => m.$chatPageDev)

  onMount(() => {
    ref.focus();

    const unsub = bindListeners(ref)

    onCleanup(() => {
      unsub()
    })
  })

  return (
    <div
      ref={el => (ref = el)}
      tabIndex={-1}
      class="relative min-h-screen h-full w-full"
    >
      <ChatHeader />
      <ChatBody />
      <ChatFooter />
    </div>
  )
}
