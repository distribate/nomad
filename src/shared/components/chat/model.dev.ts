import { createFeatureInspector } from "@/lib/helpers/inspector";
import { $chat, $chatIsLoaded } from "./model";

export const $chatPageDev = createFeatureInspector({
  title: "chatpage",
  expanded: true
}, {
  data: $chat.data,
  loaded: $chatIsLoaded
})
