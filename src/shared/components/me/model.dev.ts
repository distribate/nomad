import { createFeatureInspector } from "@/lib/helpers/inspector";
import { $user } from "@/lib/user/user.model";

export const $meDev = createFeatureInspector({
  "user": $user.data
}, {
  title: "Me"
})
