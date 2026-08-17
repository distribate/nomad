import { $currStep, $intro, $isBack, $isNext, $isValid, $introLog } from "./model";
import { createFeatureInspector } from "../../../lib/helpers/inspector";

export const $introDev = createFeatureInspector(
  { title: "Intro" },
  {
    $introIdx: $intro.idx,
    $isValid,
    $isBack,
    $isNext,
    $currStep,
    $introLog,
  }
);
