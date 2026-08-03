import { createFeatureInspector } from "../../../lib/helpers/inspector";
import { $user } from "../../../lib/user/user.model";

export const $meDev = createFeatureInspector({
  title: "Me"
}, {
  "user": $user.data
})
