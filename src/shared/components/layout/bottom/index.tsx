import { createSignal, For, onCleanup, onMount, Show, splitProps, type ComponentProps } from "solid-js"
import { useAtomAccessor } from "../../../../lib/reatom"
import { $isAuthed, $user } from "../../../../lib/user/user.model"
import { Icon, type IconName } from "../../../ui/icon"
import { useCtx } from "@reatom/npm-solid-js"
import { cva, type VariantProps } from "class-variance-authority"
import { $badgeData, BADGES, handleBadgeEvent, type Badge } from "./model"
import { atom, type Atom } from "@reatom/framework"

type BadgeBase =
  | { as: "icon", icon: IconName }
  | { as: "img", value: { src: Atom<string | null>, fallback: Atom<string> } }

const $userPhoto = atom((ctx) => ctx.spy($user.data)?.photo?.src ?? null)
const $userFirstLetterInFirstName = atom((ctx) => ctx.spy($user.data)?.firstName?.[0] ?? "Me");

const BADGES_META: Record<Badge["origin"], BadgeBase> = {
  feed: {
    as: "icon",
    icon: "sprite:compass",
  },
  contacts: {
    as: "icon",
    icon: "sprite:user-circle",
  },
  settings: {
    as: "icon",
    icon: "sprite:settings",
  },
  me: {
    as: "img",
    value: {
      src: $userPhoto,
      fallback: $userFirstLetterInFirstName,
    },
  }
}

const $bottomIsDisplay = atom((ctx) => ctx.spy($isAuthed))

const bottomBadgeVariant = cva(
  `
    flex flex-col justify-center cursor-pointer select-none
    overflow-hidden px-1 py-1.5 rounded-full gap-1 w-full h-full items-center
    disabled:opacity-50 disabled:pointer-events-none
  `,
  {
    variants: {
      variant: {
        inactive: "",
        active: "bg-brand-default/20 text-brand-default"
      }
    },
    defaultVariants: {
      variant: "inactive"
    }
  }
)

type BottomBadgeProps = ComponentProps<"button"> & VariantProps<typeof bottomBadgeVariant> & {
  label?: string
}

const BottomBadge = (props: BottomBadgeProps) => {
  const [local, others] = splitProps(props, ["class", "label", "variant", "children"]);

  return (
    <button
      class={bottomBadgeVariant({ variant: local.variant, class: local.class })}
      {...others}
    >
      {local.children}
      {local.label && (
        <span class="text-[13px] font-medium leading-3">
          {local.label}
        </span>
      )}
    </button>
  )
}
const BottomMedia = (props: { meta: BadgeBase, alt: string }) => {
  if (props.meta.as === 'icon') {
    return <Icon name={props.meta.icon} class="size-7" />
  }

  if (props.meta.as === 'img') {
    const url = useAtomAccessor(props.meta.value.src);
    const fallback = useAtomAccessor(props.meta.value.fallback);

    return (
      <div class="flex items-center justify-center rounded-full overflow-hidden h-fit aspect-square">
        <Show
          when={url()}
          fallback={fallback()}
        >
          {(src) => (
            <img
              src={src()}
              class="h-full w-full aspect-square object-cover rounded-full"
              alt={props.alt}
            />
          )}
        </Show>
      </div>
    )
  }
}
const BottomContent = () => {
  const ctx = useCtx();

  return (
    <For each={BADGES}>
      {(badge) => {
        const badgeData = useAtomAccessor($badgeData(badge.origin))
        const meta = BADGES_META[badge.origin];

        return (
          <BottomBadge
            variant={badgeData().isActive ? "active" : "inactive"}
            label={badge.label}
            onClick={() => handleBadgeEvent(ctx, badge)}
            disabled={badge.disabled ?? false}
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

  let childRef!: HTMLDivElement;

  onMount(() => {
    const obs = new IntersectionObserver(([entry]) => {
      setIsDisplay(entry.isIntersecting);
    });

    obs.observe(childRef);

    onCleanup(() => {
      obs.unobserve(childRef);
    });
  })

  onMount(() => {
    const unsub = ctx.subscribe($bottomIsDisplay, (value) => {
      setIsDisplay(value);
    });

    onCleanup(unsub);
  });

  return (
    <div
      class="flex z-4 items-center justify-center absolute bottom-2 h-16 w-full right-0 left-0"
      style={{
        display: isDisplay() ? "flex" : "none"
      }}
    >
      <div
        ref={el => (childRef = el)}
        class="flex items-center p-1.5 justify-between gap-0.5 h-full bg-neutral-600/10 backdrop-blur-xl rounded-full"
        style={{
          width: `${window.innerWidth - 44}px`
        }}
      >
        <BottomContent />
      </div>
    </div>
  )
}
