import { createSignal, For, onCleanup, onMount } from "solid-js"
import { defineRefAtom, useAtomAccessor } from "../../../../lib/reatom"
import { useCtx } from "@reatom/npm-solid-js"
import { $userFirstLetterInFirstName, $userPhoto, $badge, $bottom, $badgeIsActive } from "./model"
import type { BadgeBase } from "./types"
import { BottomBadge, BottomMedia } from "./primitives"
import { BADGES, type Badge } from "./const"

const BADGES_META: Record<Badge["origin"], BadgeBase> = {
  feed: {
    as: "icon", icon: "sprite:compass",
  },
  contacts: {
    as: "icon", icon: "sprite:user-circle",
  },
  settings: {
    as: "icon", icon: "sprite:settings",
  },
  me: {
    as: "img",
    value: {
      src: $userPhoto, fallback: $userFirstLetterInFirstName,
    },
  }
}

const BottomContent = () => {
  const ctx = useCtx();

  return (
    <For each={BADGES}>
      {(badge) => {
        const meta = BADGES_META[badge.origin];

        return (
          <BottomBadge
            variant={useAtomAccessor($badgeIsActive(badge.origin))() ? "active" : "inactive"}
            label={badge.label}
            ref={defineRefAtom(ctx, badge.origin, $bottom.badgesRefs)}
            onClick={() => $badge.execEvent(ctx, badge)}
            disabled={badge.disabled}
            onPointerDown={e => $badge.startMove(ctx, badge, e)}
          >
            <BottomMedia meta={meta} alt={badge.label} />
          </BottomBadge>
        )
      }}
    </For>
  )
}

export const Bottom = () => {
  const ctx = useCtx();
  const [isDisplay, setIsDisplay] = createSignal(false);

  onMount(() => {
    const unsub = ctx.subscribe($bottom.isEnabled, (value) => setIsDisplay(value));
    onCleanup(unsub);
  });

  let ref!: HTMLDivElement

  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      $bottom.height(ctx, entry.borderBoxSize[0].blockSize)
    })

    observer.observe(ref)

    onCleanup(() => {
      observer.disconnect();
    })
  })

  return (
    <div
      ref={el => (ref = el)}
      class="flex z-4 items-center justify-center absolute bottom-2 h-16 w-full right-0 left-0"
      style={{
        display: isDisplay() ? "flex" : "none"
      }}
    >
      <div
        ref={defineRefAtom(ctx, "bottomBar", $bottom.barRef)}
        class="flex items-center p-1.5 w-[calc(100%-44px)] justify-between gap-0.5 h-full bg-neutral-600/10 backdrop-blur-xl rounded-full"
        onPointerMove={(e) =>
          $badge.inMove(ctx, e)
        }
        onPointerUp={() =>
          $badge.stopMove(ctx)
        }
        onPointerLeave={() =>
          $badge.stopMove(ctx)
        }
      >
        <BottomContent />
      </div>
    </div>
  )
}
