import { createFeatureInspector } from "@/lib/helpers/inspector";
import { $settings } from "./model";

export const $settingsDev = createFeatureInspector({
  section: $settings.currentSection
}, {
  title: "Settings"
})
