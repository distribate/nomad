import { action, atom, reatomAsync, withAssign, withErrorAtom, withStatusesAtom } from "@reatom/framework";
import type { Profile } from "./types";
import profiles from "../../../../seed/profiles.json" with { type: "json" }

const PAGE_SIZE = 2;
const WINDOW = 3;
const PREFETCH_OFFSET = 1;

export const $feed = atom(null).pipe(
  withAssign(() => ({
    order: atom<string[]>([]),
    entities: atom(new Map<string, Profile>()),
    currentId: atom<string | null>(null),
    nextOffset: atom(0),
    hasNext: atom(true),
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

    $feed.hasNext(ctx, res.hasNext);
    $feed.nextOffset(ctx, res.nextOffset);
  }
}).pipe(
  withStatusesAtom(),
  withErrorAtom()
);

export const appendProfiles = action((ctx, profiles: Profile[]) => {
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

export const toNext = action(async (ctx) => {
  const currentId = ctx.get($feed.currentId);
  if (!currentId) return;

  let order = ctx.get($feed.order);

  let index = order.indexOf(currentId);
  if (index === -1) return;

  let nextId = order[index + 1];

  if (!nextId && ctx.get($feed.hasNext)) {
    await loadNextPage(ctx);

    order = ctx.get($feed.order);
    index = order.indexOf(currentId);

    nextId = order[index + 1];
  }

  if (nextId) {
    $feed.currentId(ctx, nextId);
  }

  const remaining = order.length - index - 1;

  if (remaining <= PREFETCH_OFFSET && ctx.get($feed.hasNext)) {
    loadNextPage(ctx);
  }

  cleanupFeed(ctx);
});

export const toPrev = action((ctx) => {
  const order = ctx.get($feed.order);
  const current = ctx.get($feed.currentId);
  if (!current) return;

  const index = order.indexOf(current);
  if (index <= 0) return;

  const prev = order[index - 1];
  $feed.currentId(ctx, prev);
});

export const loadNextPage = reatomAsync(async (ctx) => {
  if (ctx.get($feed.isFetching)) return null;

  $feed.isFetching(ctx, true);

  return getPage(ctx.get($feed.nextOffset));
}, {
  name: "_",
  onFulfill(ctx, res) {
    if (!res) return;

    appendProfiles(ctx, res.items);

    $feed.nextOffset(ctx, res.nextOffset);
    $feed.hasNext(ctx, res.hasNext);
    $feed.isFetching(ctx, false);
  },
  onReject(ctx) {
    $feed.isFetching(ctx, false);
  }
});

export const cleanupFeed = action((ctx) => {
  const order = ctx.get($feed.order);
  const entities = ctx.get($feed.entities);
  const currentId = ctx.get($feed.currentId);
  if (!currentId) return

  const index = order.indexOf(currentId);
  if (index === -1) return;

  const KEEP_BEFORE = 16;
  const KEEP_AFTER = 16;

  const start = Math.max(0, index - KEEP_BEFORE);
  const end = Math.min(order.length, index + KEEP_AFTER + 1);

  const newOrder = order.slice(start, end);
  const newEntities = new Map<string, Profile>();

  for (const id of newOrder) {
    const profile = entities.get(id);

    if (profile) {
      newEntities.set(id, profile);
    }
  }

  $feed.order(ctx, newOrder);
  $feed.entities(ctx, newEntities);
});
