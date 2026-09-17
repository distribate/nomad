import type { JSX } from "solid-js"
import { navigate } from "router/utils";

type LinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export const Link = (props: LinkProps) => {
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
