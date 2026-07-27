import type { UserPhoto, UserStyle } from "../../../lib/user/types"

export type Profile = {
  firstName: string,
  age: number,
  description: string,
  interests: string[],
  style: UserStyle,
  goal: string,
  photo: UserPhoto
}
