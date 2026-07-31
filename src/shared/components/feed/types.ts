import type { UserPhoto, UserStyle } from "../../../lib/user/types"

export type Profile = {
  id: string,
  firstName: string,
  age: number,
  description: string,
  interests: string[],
  style: UserStyle,
  goal: string,
  photo: UserPhoto
}
