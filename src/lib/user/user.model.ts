import { atom, withAssign } from "@reatom/framework";
import { withLocalStorage } from '@reatom/persist-web-storage'
import type { UserPhoto } from "./types";
import { expose } from "../utils";
import { getReatomCtx } from "../app";

export type User = {
  username: string; // (initially random hash string) (editable)
  firstName: string; // required, from user (editable)
  createdAt: string; // (automatically set to current date)
  photo: UserPhoto
}

export const $user = atom(null, "user").pipe(
  withAssign((_, name) => ({
    data: atom<User | null>(null, `${name}.data`).pipe(
      // temporary
      withLocalStorage("user")
    )
  }))
)

expose(function getUser() {
  return getReatomCtx().get($user.data);
});
