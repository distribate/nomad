import { useAtomAccessor } from "@/lib/helpers/reatom";
import { For } from "solid-js";
import { $chatsActiveFolder, $chatsFolders } from "./model";
import { useCtx } from "@reatom/npm-solid-js";

export const ChatsFolders = () => {
  const ctx = useCtx();
  const folders = useAtomAccessor($chatsFolders);
  const activeFolder = useAtomAccessor($chatsActiveFolder);

  return (
    <div class="relative w-full flex items-center justify-center py-2">
      <div
        class="
          flex items-center relative w-[calc(100%-32px)] p-1
          rounded-full bg-neutral-800 justify-start overflow-x-auto min-h-8 h-8
        "
      >
        <For each={folders()}>
          {(folder) => {
            return (
              <div
                classList={{
                  "flex h-6 items-center justify-center rounded-full px-4 py-0.5 text-sm": true,
                  "bg-neutral-100/20": folder.id === activeFolder()
                }}
                onClick={() => {
                  $chatsActiveFolder(ctx, folder.id)
                }}
              >
                <span>
                  {folder.title}
                </span>
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}
