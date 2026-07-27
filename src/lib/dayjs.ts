import { action } from "@reatom/framework"
import dayjs from "dayjs"

export const installDayjsLocale = async () => {
  await import("dayjs/locale/ru")
  dayjs.locale("ru")
}

export const setupDayjs = action(async () => {
  await installDayjsLocale()
}, "setupDayjs")

export const getDayjs = () => dayjs()
