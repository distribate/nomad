import { atom, withAssign, type Ctx } from "@reatom/framework";
import { withLocalStorage } from '@reatom/persist-web-storage'
import type { UserPhoto } from "./types";
import { expose } from "../utils";
import { getReatomCtx } from "../app/ctx";
import { redirect } from "../router/utils";

export type User = {
  username: string; // (initially random hash string) (editable)
  firstName: string; // required, from user (editable)
  createdAt: string; // (automatically set to current date)
  photo: UserPhoto | null
}

export const $user = atom(null, "user").pipe(
  withAssign((_, name) => ({
    data: atom<User | null>(null, `${name}.data`).pipe(
      // temporary
      withLocalStorage("user")
    )
  }))
)

export const $isAuthed = atom((ctx) => {
  const user = ctx.spy($user.data);
  return !!user
})

export function withAuth(ctx: Ctx) {
  const isAuthed = ctx.get($isAuthed);
  if (!isAuthed) throw redirect("/intro");
}

if (import.meta.env.DEV) {
  expose(function getCurrentUser() {
    return getReatomCtx().get($user.data);
  })
}
