import { createFeatureInspector } from "../../../lib/helpers/inspector";
import { $settings } from "./model";

export const $settingsDev = createFeatureInspector({
  title: "Settings"
}, {
  section: $settings.currentSection
})
