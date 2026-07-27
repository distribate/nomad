import { cva, type VariantProps } from "class-variance-authority";
import cn from "cnfast";
import { mergeProps, splitProps, type ComponentProps, type JSXElement } from "solid-js";

type TitleProps =
  | { as: "text", msg: string }
  | { as: "node", children: JSXElement }

export const titleTextStyle = "text-[28px] leading-8 font-semibold line-clamp-3"
export const Title = (rawProps: TitleProps) => {
  const props = mergeProps({ as: "text" as const }, rawProps);

  return (
    props.as === "text" ? (
      <div class="flex w-full items-center min-w-0 justify-start">
        <p class={cn(titleTextStyle, "text-left")}>
          {props.msg}
        </p>
      </div>
    ) : (
      props.children
    )
  )
}

const blockVariant = cva(
  `flex items-center justify-center hover:scale-[1.03] rounded-xl px-4 py-3 text-sm transition-all`,
  {
    variants: {
      variant: {
        active: "bg-brand-default text-white",
        inactive: "bg-white/10 text-white/80"
      }
    },
    defaultVariants: {
      variant: "inactive"
    }
  }
)

type BlockProps = ComponentProps<"button"> & VariantProps<typeof blockVariant>
export const Block = (props: BlockProps) => {
  const [local, other] = splitProps(props, ["class", "variant"]);

  return (
    <button
      class={blockVariant({ class: local.class, variant: local.variant })}
      {...other}
    />
  )
}
