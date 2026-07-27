import { gsap } from "gsap";
import { GSAP_PLUGINS } from ".";
import { config } from "../../const/config";

if (config.withGsap) {
  gsap.registerPlugin(...GSAP_PLUGINS);
  console.log("gsap setup")
} else {
  console.log("gsap skip")
}
