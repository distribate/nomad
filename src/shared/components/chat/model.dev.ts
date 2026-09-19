import { createFeatureInspector } from "@/lib/helpers/inspector";
import { $chat, $chatIsLoaded } from "./model";

export const $chatPageDev = createFeatureInspector({
  data: $chat.data,
  loaded: $chatIsLoaded
}, {
  title: "chatpage",
  expanded: true
})
