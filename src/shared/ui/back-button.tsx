import { splitProps, type ComponentProps } from "solid-js"
import { Button } from "./button"
import { Icon } from "./icon"

export const BackButton = (props: ComponentProps<"button"> & { label?: string }) => {
  const [local, others] = splitProps(props, ["label"])

  return (
    <Button
      size="icon"
      class="text-lg aspect-square rounded-full p-0 bg-white/80 text-black backdrop-blur-xl"
      {...others}
    >
      {local.label ?? <Icon name="sprite:arrow-left" class="size-5" />}
    </Button>
  )
}
