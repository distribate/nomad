import { mergeProps, splitProps, type ComponentProps } from "solid-js";
import { useAtomAccessor } from "../../lib/reatom";
import { $header } from "./layout/header/model";
import { $bottom } from "./layout/bottom/model";

type WithTopPaddingProps = ComponentProps<"div"> & {
  withBottom?: boolean;
  withTop?: boolean;
};

export const WithTopPadding = (rawProps: WithTopPaddingProps) => {
  const props = mergeProps(
    {
      withTop: true,
      withBottom: true
    },
    rawProps
  );

  const [local, others] = splitProps(props, [
    "style",
    "withTop",
    "withBottom",
  ]);

  const t = useAtomAccessor($header.height);
  const b = useAtomAccessor($bottom.height);

  return (
    <div
      style={{
        "padding-top": local.withTop ? `${t()}px` : undefined,
        "padding-bottom": local.withBottom ? `${b() + 8}px` : undefined,
        ...(typeof local.style === "object" ? local.style : {}),
      }}
      {...others}
    />
  )
}
