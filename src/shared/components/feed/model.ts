import { action, atom, reatomAsync, withAssign, withErrorAtom, withStatusesAtom } from "@reatom/framework";
import type { Profile } from "./types";
import profiles from "../../../../seed/profiles.json" with { type: "json" }

const PAGE_SIZE = 2;
const WINDOW = 3;

export const $feed = atom(null).pipe(
  withAssign(() => ({
    offsetY: atom(0),
    order: atom<string[]>([]),
    entities: atom(new Map<string, Profile>()),
    currentId: atom<string | null>(null),
    isFetching: atom(false),
  }))
)

export const $visibleProfiles = atom((ctx) => {
  const order = ctx.spy($feed.order);
  const entities = ctx.spy($feed.entities);
  const currentId = ctx.spy($feed.currentId);
  if (!currentId) return [];

  const index = order.indexOf(currentId);
  if (index === -1) return [];

  let start = Math.max(0, index - Math.floor(WINDOW / 2));
  let end = start + WINDOW;

  if (end > order.length) {
    end = order.length;
    start = Math.max(0, end - WINDOW);
  }

  return order
    .slice(start, end)
    .map((id) => entities.get(id)!)
    .filter(Boolean);
});

export const $feedStatuses = atom(null).pipe(
  withAssign(() => ({
    profilesIsLoading: atom((ctx) =>
      ctx.spy(loadProfiles.statusesAtom).isPending
    ),
    profilesError: atom((ctx) =>
      ctx.spy(loadProfiles.errorAtom)
    ),
  }))
)

const shuffle = (a: Profile[]) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const allProfiles = shuffle([...profiles[""] as Profile[]]);

const getPage = (offset: number) => {
  const items = allProfiles.slice(offset, offset + PAGE_SIZE);

  return {
    items,
    hasNext: offset + PAGE_SIZE < allProfiles.length,
    nextOffset: offset + PAGE_SIZE,
  };
};

export const loadProfiles = reatomAsync(async (ctx) => {
  return getPage(0);
}, {
  name: "_",
  onFulfill: (ctx, res) => {
    appendProfiles(ctx, res.items);
  }
}).pipe(
  withStatusesAtom(),
  withErrorAtom()
);

const appendProfiles = action((ctx, profiles: Profile[]) => {
  const entities = new Map(ctx.get($feed.entities));
  const order = [...ctx.get($feed.order)];

  for (const profile of profiles) {
    if (entities.has(profile.id)) continue;

    entities.set(profile.id, profile);
    order.push(profile.id);
  }

  $feed.entities(ctx, entities);
  $feed.order(ctx, order);

  if (!ctx.get($feed.currentId) && order.length) {
    $feed.currentId(ctx, order[0]);
  }
});
