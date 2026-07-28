import { action } from "@reatom/framework"
import dayjs from "dayjs"
import { withRule } from "./helpers"
import { getConfigVal } from "../const/config";
import { $appState } from "./app/app.model";

const locales = {
  ru: () => import("dayjs/locale/ru"),
  en: () => import("dayjs/locale/en"),
  es: () => import("dayjs/locale/es"),
};

export const installDayjsLocale = async (targetLocale: string) => {
  try {
    console.log(`Loaded locale for ${targetLocale}`)
    await locales[targetLocale as unknown as keyof typeof locales]()
  } catch (e) {
    console.error("Failed to load locale. Falling back to ru")
    await locales.ru()
  }

  dayjs.locale(targetLocale)
}

export const setupDayjs = action(async (ctx) => {
  const locale = ctx.get($appState.meta.preferredLang).split("-")[0];
  await installDayjsLocale(locale)
}, withRule("setupDayjs", getConfigVal("withAppActionsLog")))

export const getDayjs = () => dayjs()
