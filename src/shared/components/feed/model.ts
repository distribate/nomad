import { atom, reatomAsync, sleep, withAssign, withErrorAtom, withReset, withStatusesAtom } from "@reatom/framework";
import type { Profile } from "./types";
import profiles from "../../../../seed/profiles.json" with { type: "json" }
import { $user } from "../../../lib/user/user.model";

export const $feed = atom(null, "feed").pipe(
  withAssign((_, name) => ({
    profiles: atom<Profile[]>([], `${name}.profiles`),
    wrapRef: atom<HTMLDivElement | null>(null, `${name}.wrapRef`).pipe(withReset())
  }))
)

export const $feedStatuses = atom(null, "feedStatuses").pipe(
  withAssign((_, name) => ({
    profilesIsLoading: atom((ctx) => ctx.spy(loadProfiles.statusesAtom).isPending, `${name}.profilesIsLoading`),
    profilesError: atom((ctx) =>
      ctx.spy(loadProfiles.errorAtom), `${name}.profilesError`
    )
  }))
)

const shuffle = (arr: Profile[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const loadProfiles = reatomAsync(async (ctx) => {
  const user = ctx.get($user.data)
  if (!user) throw new Error("User not found");

  await sleep(200); // emulate network delay
  return shuffle(profiles[""] as Profile[])
}, {
  name: "loadProfiles",
  onFulfill: (ctx, res) => {
    $feed.profiles(ctx, res)
  }
}).pipe(
  withStatusesAtom(),
  withErrorAtom()
)
