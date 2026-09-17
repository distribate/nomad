import cn from "cnfast"
import { splitProps, type ComponentProps } from "solid-js"

export const Skeleton = (props: ComponentProps<"div">) => {
  const [local, others] = splitProps(props, ["class"])

  return (
    <div
      {...others}
      class={cn(
        `
          relative
          overflow-hidden
          rounded-xl
          bg-neutral-500/80
          before:pointer-events-none
          before:absolute
          before:inset-0
          before:-translate-x-full
          before:bg-linear-to-r
          before:from-transparent
          before:via-white/60
          before:to-transparent
          before:animate-shimmer
        `,
        local.class,
      )}
    />
  )
}
