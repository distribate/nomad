import { $currStep, $intro, $isBack, $isNext, $isValid } from "./model";
import { createFeatureInspector } from "../../../lib/helpers/inspector";

export const $introDev = createFeatureInspector(
  { title: "Intro" },
  {
    currentStepIdx: $intro.idx,
    isValid: $isValid,
    isBack: $isBack,
    isNext: $isNext,
    currentStep: $currStep,
  }
);
