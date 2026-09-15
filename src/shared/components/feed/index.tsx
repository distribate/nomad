import { For, onMount, Show } from "solid-js"
import { $feedStatuses, $visibleProfiles, $feed } from "./model"
import { useAtomAccessor } from "../../../lib/helpers/reatom";
import type { Profile } from "./types";
import { useAtom, useCtx } from "@reatom/npm-solid-js";
import { WithTopPadding } from "../global/layouts";
import { Icon, type IconName } from "../../ui/icon";
import { onCleanup } from "solid-js";
import { $bottom } from "../layout/bottom/model";

const FeedProfilesError = (props: { error: Error }) => {
  return (
    <div class="text-red-500 font-semibold">
      {props.error.message}
    </div>
  )
}

const FeedProfileInfo = (props: { profile: Profile }) => {
  return (
    <div class="absolute bottom-0 left-0 right-16 p-4 z-20 flex flex-col gap-2">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-2xl font-bold tracking-wide">
          {props.profile.firstName}
        </span>
        <span class="text-xl text-white/80">
          {props.profile.age}
        </span>
        <span
          class="
            px-2 py-0.5 text-xs font-semibold rounded-full
            bg-white/20 backdrop-blur-md border border-white/20 capitalize
          "
        >
          {props.profile.style}
        </span>
      </div>
      <p class="text-sm text-white/90 line-clamp-2 leading-relaxed">
        {props.profile.description}
      </p>
      {props.profile.goal && (
        <div class="flex items-center gap-1 text-xs bg-black/50 px-3 py-1 rounded-xl w-fit">
          <span>✨</span>
          <span class="truncate">
            {props.profile.goal}
          </span>
        </div>
      )}
      <div class="flex flex-wrap gap-1.5 pt-1">
        <For each={props.profile.interests}>
          {(data) => (
            <span class="text-xs font-semibold text-white/80">
              #{data.toLowerCase().replace(/\s+/g, "")}
            </span>
          )}
        </For>
      </div>
    </div>
  )
}

const FeedProfileEventChild = (props: { text: string, icon: IconName }) => {
  return (
    <div class="flex flex-col items-center">
      <div class="w-10 h-10 rounded-full flex items-center justify-center">
        <Icon name={props.icon} class="size-8 fill-white" />
      </div>
      <span class="text-sm font-semibold">{props.text}</span>
    </div>
  )
}

const FeedProfileEvents = (props: { profile: Profile }) => {
  return (
    <div class="absolute right-4 bottom-20 z-20 flex flex-col items-center gap-5">
      <div class="relative mb-2">
        <div class="w-12 h-12 rounded-full bg-black overflow-hidden">
          <img
            src={props.profile.photo?.src}
            alt={props.profile.firstName}
            class="w-full h-full object-cover"
          />
        </div>
        <div
          class="
            absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white
            rounded-full flex items-center justify-center text-black font-bold
          "
        >
          +
        </div>
      </div>
      <FeedProfileEventChild icon="sprite:heart" text="0" />
      <FeedProfileEventChild icon="sprite:share-3" text="0" />
    </div>
  )
}
const FeedProfileImage = (props: { profile: Profile }) => {
  return (
    <img
      src={props.profile.photo?.src}
      alt={props.profile.firstName}
      class="absolute inset-0 w-full h-full object-cover"
      loading="eager"
    />
  )
}

const FeedOverlay = () => (
  <div
    class="absolute inset-0 bg-linear-to-b
      from-black/20 via-transparent to-black/90 pointer-events-none"
  />
)

const FeedProfile = (props: { profile: Profile }) => {
  const ctx = useCtx();

  const [offsetY, setOffsetY] = useAtom($feed.offsetY);

  onMount(() => {
    const bottomHeight = ctx.get($bottom.height);
    setOffsetY(-bottomHeight);

    onCleanup(() => {
      setOffsetY(0);
    })
  })

  return (
    <WithTopPadding
      id={`feed-profile-${props.profile.id}`}
      class="relative w-full h-screen overflow-hidden select-none"
      withBottom={true}
      withTop={false}
    >
      <FeedProfileImage profile={props.profile} />
      <FeedOverlay />
      <div
        id={`feed-profile-content-${props.profile.id}`}
        class="flex absolute h-full w-full items-center justify-center"
        style={{
          transform: `translateY(${offsetY()}px)`
        }}
      >
        <FeedProfileEvents profile={props.profile} />
        <FeedProfileInfo profile={props.profile} />
      </div>
    </WithTopPadding>
  )
}

export const FeedLoader = () => {
  return (
    <div>Loading profiles...</div>
  )
}

export const Feed = () => {
  const err = useAtomAccessor($feedStatuses.profilesError);
  const data = useAtomAccessor($visibleProfiles);

  return (
    <Show
      when={!err()}
      fallback={
        <FeedProfilesError error={err()!} />
      }
    >
      <div id="feed-root">
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
