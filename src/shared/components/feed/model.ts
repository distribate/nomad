import { atom, reatomAsync, sleep, withAssign, withErrorAtom, withStatusesAtom } from "@reatom/framework";
import type { Profile } from "./types";
import profiles from "../../../../seed/profiles.json" with { type: "json" }

export const $feed = atom(null, "feed").pipe(
  withAssign((_, name) => ({
    profiles: atom<Profile[]>([], `${name}.profiles`)
  }))
)

export const $feedStatuses = atom(null, "feedStatuses").pipe(
  withAssign((_, name) => ({
    profilesIsLoading: atom((ctx) => ctx.spy(loadProfiles.statusesAtom).isPending, `${name}.profilesIsLoading`),
  }))
)

export const loadProfiles = reatomAsync(async (ctx) => {
  await sleep(2000); // emulate network delay
  return profiles[""] as Profile[]
}, {
  name: "loadProfiles",
  onFulfill: (ctx, res) => {
    $feed.profiles(ctx, res)
  }
}).pipe(
  withStatusesAtom(),
  withErrorAtom()
)
