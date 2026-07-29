import { Show, splitProps, type ComponentProps } from "solid-js";
import { useAtomAccessor } from "../../../../lib/reatom";
import { cva, type VariantProps } from "class-variance-authority";
import type { BadgeBase } from "./types";
import { Icon } from "../../../ui/icon";

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

export const BottomBadge = (props: BottomBadgeProps) => {
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
export const BottomMedia = (props: { meta: BadgeBase, alt: string }) => {
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
