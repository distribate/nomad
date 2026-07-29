import { splitProps, type ComponentProps } from "solid-js"
import { Button } from "./button"
import { Icon } from "./icon"

export const BackButton = (props: ComponentProps<"button"> & { label?: string }) => {
  const [local, others] = splitProps(props, ["label"])

  return (
    <Button class="text-lg aspect-square rounded-full p-0 h-9 w-9 bg-white/80 text-black backdrop-blur-xl" {...others}>
      {local.label ?? <Icon name="sprite:arrow-left" class="size-5" />}
    </Button>
  )
}
