import { atom, reatomAsync, withAssign, withErrorAtom, withStatusesAtom, type Ctx } from "@reatom/framework";
import { withLocalStorage } from '@reatom/persist-web-storage'
import type { UserPhoto } from "./types";
import { expose } from "../utils";
import { getReatomCtx } from "../app/ctx";
import { navigate, redirect } from "../router/utils";
import { $alertDialog } from "../../shared/components/global/alert-dialog/model";
import { $appState } from "../app/app.model";
import { watch, watchersModel } from "../helpers/watchers";

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

export const initUser = reatomAsync(async (ctx) => {
  userWatchers.define(ctx);

  const isTMA = ctx.get($appState.type) === 'tma'

  if (isTMA) {
    const { retrieveLaunchParams } = await import("@tma.js/sdk")
    const launchParams = retrieveLaunchParams();
    const tgUser = launchParams.tgWebAppData?.user;

    if (tgUser) {
      $user.data(ctx, {
        photo: tgUser.photo_url ? { src: tgUser.photo_url } : null,
        firstName: tgUser.first_name,
        username: tgUser.username ?? "unknown",
        createdAt: new Date().toISOString()
      })
    }
  } else {
    const curr = ctx.get($user.data)
    if (!curr) return;

    $user.data(ctx, {
      ...curr,
      photo: { src: "https://picsum.photos/id/237/200/300" }
    })
  }
}, "initUser").pipe(
  withStatusesAtom(),
  withErrorAtom()
)

export const $logout = atom(null, "logout").pipe(
  withAssign((_, name) => ({
    exec: reatomAsync(async (ctx) => {
      const confirmed = await $alertDialog.open(ctx, {
        title: "Logout",
        description: "Are you sure you want to logout?",
        confirmLabel: "Yes",
        cancelLabel: "No",
      });

      if (!confirmed) return false;

      $user.data(ctx, null);
      return true;
    }, `${name}.exec`).pipe(
      withStatusesAtom(),
      withErrorAtom()
    )
  }))
)

const userWatchers = watchersModel({
  name: "app",
  watchers: [
    watch($isAuthed, {
      condition: (isAuthed) => !isAuthed,
      handler: (_, isAuthed) => {
        !isAuthed && navigate("/intro");
      },
    }),
  ]
})

expose(function getCurrentUser() {
  return getReatomCtx().get($user.data);
})
