import { useCtx } from "@reatom/npm-solid-js";
import type { JSX } from "solid-js"
import { navigate } from "../../../lib/router/utils";

type LinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export const Link = (props: LinkProps) => {
  const ctx = useCtx();

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    navigate(props.href);
  };

  return (
    <a {...props} onClick={handleClick}>
      {props.children}
    </a>
  );
};
