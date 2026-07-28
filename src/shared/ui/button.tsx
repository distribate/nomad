import type { JSX, ValidComponent } from "solid-js"
import { splitProps } from "solid-js"
import * as ButtonPrimitive from "@kobalte/core/button"
import type { PolymorphicProps } from "@kobalte/core/polymorphic"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import { cn } from "cnfast"

const buttonVariants = cva(
  `inline-flex items-center cursor-pointer active:scale-[.994] justify-center gap-2 whitespace-nowrap rounded-xl
  text-sm font-semibold ring-0 duration-150 ease-in-out
  disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none`,
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-neutral-300",
        neutral: "bg-neutral-800 text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        danger: "bg-red-600 text-primary-foreground hover:bg-red-700"
      },
      size: {
        default: "h-10 px-4 py-2",
        icon: "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

type ButtonProps<T extends ValidComponent = "button"> = ButtonPrimitive.ButtonRootProps<T> &
  VariantProps<typeof buttonVariants> & { class?: string | undefined; children?: JSX.Element }

const Button = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, ButtonProps<T>>
) => {
  const [local, others] = splitProps(props as ButtonProps, ["variant", "size", "class"]);

  return (
    <ButtonPrimitive.Root
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      {...others}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
