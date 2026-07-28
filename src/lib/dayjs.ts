import { action } from "@reatom/framework"
import dayjs from "dayjs"
import { withRule } from "./helpers"
import { config } from "../const/config";

type TargetLocale = "ru" | "en"

const locales = {
  ru: () => import("dayjs/locale/ru"),
  en: () => import("dayjs/locale/en"),
  es: () => import("dayjs/locale/es"),
};

export const installDayjsLocale = async (targetLocale: TargetLocale) => {
  try {
    await locales[targetLocale]()
  } catch (e) {
    console.error("Failed to load locale. Falling back to ru")
    await locales.ru()
  }

  dayjs.locale(targetLocale)
}

export const setupDayjs = action(async (
  _, locale: TargetLocale
) => {
  await installDayjsLocale(locale)
},
  withRule("setupDayjs", config.withAppActionsLog)
)

export const getDayjs = () => dayjs()
