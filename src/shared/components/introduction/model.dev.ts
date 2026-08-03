import { $currStep, $intro, $isValid } from "./model";
import { createFeatureInspector } from "../../../lib/helpers/inspector";

export const $introDev = createFeatureInspector(
  { title: "Intro" },
  {
    currentStepIdx: $intro.idx,
    isValid: $isValid,
    currentStep: $currStep,
  }
);
