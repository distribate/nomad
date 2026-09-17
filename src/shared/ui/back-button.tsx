import { splitProps, type ComponentProps } from "solid-js"
import { Button } from "./button"
import { Icon } from "./icon"
import { cva } from "class-variance-authority"

export const triggerButtonVariant = cva(
  "text-lg aspect-square pointer-events-auto rounded-full! p-0 bg-white/80 text-black backdrop-blur-xl"
)

export const BackButton = (props: ComponentProps<"button"> & { label?: string }) => {
  const [local, others] = splitProps(props, ["label", "class"])

  return (
    <Button
      size="icon"
      class={triggerButtonVariant({ class: local.class })}
      {...others}
    >
      {local.label ?? <Icon name="sprite:arrow-left" class="size-5" />}
    </Button>
  )
}
