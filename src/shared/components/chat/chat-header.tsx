import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { $bottom } from "../layout/bottom/model";
import { useAtomAccessor } from "@/lib/helpers/reatom";
import { $chat, $chatIsLoaded } from "./model";
import { useCtx } from "@reatom/npm-solid-js";
import { atom, pick } from "@reatom/framework";
import { $headerNodes } from "../layout/header/model";
import { BackButton, triggerButtonVariant } from "@/shared/ui/back-button";
import { navigate } from "router/utils";
import { createMoreActions, MoreEvents } from "../global/more";
import { Skeleton } from "@/shared/ui/skeleton";

const $chatHeader = atom((ctx) => {
  const target = ctx.spy($chat.data);
  if (!ctx.spy($chatIsLoaded) || !target) return null;

  const result = pick(target, ["username", "avatar", "id"]);
  return result;
})

const ChatHeaderSkeleton = () => {
  return (
    <>
      <Skeleton class="w-32 h-4" />
      <Skeleton class="w-16 h-3" />
    </>
  )
}
export const ChatHeader = () => {
  const ctx = useCtx();

  // const chatIsLoaded = useAtomAccessor($chatIsLoaded);

  onMount(() => {
    $bottom.offsetY(ctx, 600)

    $headerNodes.update(ctx, {
      l: () =>
        <BackButton onClick={() => navigate("/")} />,
      c: () => {
        const data = useAtomAccessor($chatHeader);

        return (
          <div class="flex pointer-events-auto items-center p-1 h-10 bg-neutral-800 rounded-full gap-2 w-full">
            <div class="h-9 w-9 aspect-square rounded-full overflow-hidden">
              <Show
                fallback={<Skeleton class="w-full h-full" />}
                when={data()}
              >
                {(data) => (
                  <img
                    src={data().avatar}
                    alt={data().username}
                    class="w-full h-full object-cover"
                  />
                )}
              </Show>
            </div>
            <div class="flex items-start flex-col gap-0.5">
              <Show
                fallback={<ChatHeaderSkeleton />}
                when={data()}
              >
                {(data) => (
                  <>
                    <h1 class="text-sm leading-4">
                      {data().username}
                    </h1>
                    <span class="text-xs text-neutral-400 truncate">
                      last seen recently
                    </span>
                  </>
                )}
              </Show>
            </div>
          </div >
        )
      },
      r: () => {
        const [payload, setPayload] = createSignal<{ data: any, is: boolean }>({ data: null, is: false });

        return (
          <MoreEvents
            class={triggerButtonVariant({ class: "h-10 flex items-center justify-center" })}
            events={
              createMoreActions({
                simulate: {
                  as: "click",
                  label: payload().is ? "Stop" : "Simulate",
                  action(ctx) {
                    if (payload().is) {
                      $chat.data(ctx, payload().data);
                      setPayload({ data: null, is: false });
                      return;
                    }

                    setPayload({ data: ctx.get($chat.data), is: true });
                    $chat.data(ctx, null);
                  }
                }
              })
            }
          />
        )
      }
    }, {
      withBlur: true
    })

    onCleanup(() => {
      $bottom.offsetY(ctx, 0)

      $headerNodes.update(ctx, {
        l: null,
        c: null,
        r: null
      }, {
        withBlur: false
      })
    })
  })

  return null;
}
