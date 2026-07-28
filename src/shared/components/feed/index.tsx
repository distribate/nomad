import { For, Show } from "solid-js"
import { $feed, $feedStatuses } from "./model"
import { defineRefAtom, useAtomAccessor } from "../../../lib/reatom";
import type { Profile } from "./types";
import { useCtx } from "@reatom/npm-solid-js";

const FeedProfilesError = (props: { error: Error }) => {
  return (
    <div class="text-red-500 font-semibold">
      {props.error.message}
    </div>
  )
}

const FeedProfile = (props: { profile: Profile }) => {
  const profile = () => props.profile;

  return (
    <div class="relative w-full h-screen overflow-hidden bg-black text-white shadow-2xl select-none font-sans">
      <img
        src={profile().photo?.src}
        alt={profile().firstName}
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />
      <div class="absolute right-4 bottom-20 z-20 flex flex-col items-center gap-5">
        <div class="relative mb-2">
          <div class="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
            <img
              src={profile().photo?.src}
              alt={profile().firstName}
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
            +
          </div>
        </div>
        <div class="flex flex-col items-center gap-1">
          <div class="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <svg class="w-6 h-6 text-white fill-white" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span class="text-xs font-semibold drop-shadow">Like</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <div class="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span class="text-xs font-semibold drop-shadow">Pass</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <div class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-16 p-5 z-20 flex flex-col gap-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-2xl font-bold tracking-wide drop-shadow">
            {profile().firstName}
          </span>
          <span class="text-xl font-normal text-white/80">
            {profile().age}
          </span>
          <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-md border border-white/30 capitalize">
            {profile().style}
          </span>
        </div>
        <p class="text-sm text-white/90 line-clamp-2 leading-relaxed drop-shadow">
          {profile().description}
        </p>
        {profile().goal && (
          <div class="flex items-center gap-1.5 text-xs font-medium text-amber-300 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-300/30 w-fit">
            <span>✨</span>
            <span class="truncate">{profile().goal}</span>
          </div>
        )}
        <div class="flex flex-wrap gap-1.5 pt-1">
          <For each={profile().interests}>
            {(data) => (
              <span class="text-xs font-semibold text-white/80">
                #{data.toLowerCase().replace(/\s+/g, "")}
              </span>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}

export const FeedLoader = () => {
  return (
    <div>Loading profiles...</div>
  )
}

export const Feed = () => {
  const ctx = useCtx();

  const err = useAtomAccessor($feedStatuses.profilesError);
  const data = useAtomAccessor($feed.profiles);

  return (
    <Show
      when={!err()}
      fallback={
        <FeedProfilesError error={err()!} />
      }
    >
      <div ref={defineRefAtom(ctx, "feedWrapper", $feed.wrapRef)}>
        <For each={data()}>
          {(p) => <FeedProfile profile={p} />}
        </For>
      </div>
    </Show>
  )
}

export const FeedFallback = () => {
  return (
    <div>
      Index Fallback
    </div>
  )
}
