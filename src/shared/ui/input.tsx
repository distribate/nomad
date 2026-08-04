import { cva, type VariantProps } from "class-variance-authority";
import cn from "cnfast";
import { createUniqueId, type JSX, splitProps, type Component } from "solid-js";

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const inputVariant = cva(`
  peer w-full min-w-0 h-14 rounded-2xl px-4 bg-transparent text-base outline-none transition-[color,box-shadow]
  disabled:pointer-events-none focus-within:border-brand-default disabled:cursor-not-allowed disabled:opacity-50
  aria-invalid:border-danger-primary aria-invalid:ring-danger-primary
`, {
  variants: {
    variant: {
      default: "border-2 border-neutral-400/12 pt-4",
      headless: "py-0.5"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

export const Input: Component<InputProps & VariantProps<typeof inputVariant>> = (props) => {
  const [local, inputProps] = splitProps(props, ["class", "id", "variant", "label", "type"])

  const generatedId = createUniqueId()
  const inputId = () => local.id || generatedId

  return (
    <div class="relative w-full">
      <input
        {...inputProps}
        id={inputId()}
        type={local.type || "text"}
        placeholder={local.label ? local.label : inputProps.placeholder}
        class={inputVariant({ variant: local.variant, class: local.class })}
      />
      {local.label && (
        <label
          for={inputId()}
          class={cn(
            "pointer-events-none absolute left-4 top-4 origin-left text-base font-medium text-labels-neutral-secondary/72 transition-all duration-150 ease-out",
            "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100",
            "peer-focus:-translate-y-2.5 peer-focus:scale-75",
            "peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:scale-75"
          )}
        >
          {local.label}
        </label>
      )}
    </div>
  )
}
