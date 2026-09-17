import { Icon } from "@/shared/ui/icon"
import { Input } from "@/shared/ui/input"
import { useCtx } from "@reatom/npm-solid-js"
import { onCleanup, onMount, Show, type ParentComponent } from "solid-js"
import { $chatFooter, $msgText, $msgTypemode, defineAttachs, sendMsg } from "./model"
import { useAtomAccessor } from "@/lib/helpers/reatom"

const ChatFooterButton: ParentComponent<{ variant?: "filled" | "default" }> = (props) => {
  return (
    <div
      classList={{
        "rounded-full flex items-center justify-center aspect-square h-8": true,
        "bg-brand-default": props.variant === "filled",
      }}
      {...props}
    />
  )
}

export const ChatFooter = () => {
  const ctx = useCtx();

  let ref!: HTMLDivElement

  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      $chatFooter.height(ctx, entry.borderBoxSize[0].blockSize)
    })

    observer.observe(ref)

    onCleanup(() => {
      observer.disconnect();
    })
  })

  const typeMode = useAtomAccessor($msgTypemode)
  const msgText = useAtomAccessor($msgText);

  let attachRef!: HTMLInputElement;

  return (
    <div
      class="absolute rounded-full overflow-hidden bg-neutral-800 p-1 bottom-2 right-4 left-4 z-22 border border-neutral-700/20"
      ref={el => (ref = el)}
    >
      <form
        onSubmit={e => sendMsg(ctx, e)}
        class="flex items-center w-full h-8"
      >
        <Input
          name="message"
          variant="headless"
          value={msgText()}
          placeholder="Message"
          class="h-6 px-2"
          borderVariant="headless"
          onInput={e => $msgText(ctx, e.target.value)}
        />
        <div class="flex items-center gap-1">
          <Show when={typeMode() === 'none'}>
            <>
              <ChatFooterButton>
                <input
                  type="file"
                  ref={attachRef}
                  style={{ display: 'none' }}
                  onChange={e => defineAttachs(ctx, e.target.files)}
                />
                <Icon name="sprite:file" onClick={() => attachRef.click()} />
              </ChatFooterButton>
              <ChatFooterButton variant="filled">
                <Icon name="sprite:camera" />
              </ChatFooterButton>
            </>
          </Show>
          <Show when={typeMode() === 'text'}>
            <ChatFooterButton variant="filled">
              <button type="submit">
                <Icon name="sprite:send-2" />
              </button>
            </ChatFooterButton>
          </Show>
        </div>
      </form>
    </div>
  )
}
