import { splitProps, type ComponentProps } from "solid-js"
import { Button } from "./button"

export const BackButton = (props: ComponentProps<"button"> & { label?: string }) => {
  const [local, others] = splitProps(props, ["label"])

  return (
    <Button class="text-lg aspect-square h-10 w-10 bg-white/60 text-black backdrop-blur-xl" {...others}>
      {local.label ?? "<-"}
    </Button>
  )
}
