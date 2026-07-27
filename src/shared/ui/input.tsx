import { cva, type VariantProps } from "class-variance-authority";
import cn from "cnfast";
import { splitProps, type ComponentProps } from "solid-js";

const inputVariant = cva(
  `flex items-center justify-start outline-none border-none bg-neutral-800 text-neutral-50
  rounded-xl overflow-hidden py-1 px-4 font-medium focus-within:ring-2 focus-within:ring-brand-default
  `,
  {
    variants: {
      size: {
        sm: "",
        md: "h-10 text-sm",
        lg: "h-14 text-lg"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
)

type InputProps = ComponentProps<"input"> & VariantProps<typeof inputVariant>;

export const Input = (props: InputProps) => {
  const [local, others] = splitProps(props, ["class", "size"]);

  return (
    <input
      class={cn(
        inputVariant({ size: local.size }),
        local.class
      )}
      {...others}
    />
  )
}
