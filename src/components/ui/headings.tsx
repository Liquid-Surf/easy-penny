import { FC, HTMLAttributes } from "react";

export const PageTitle: FC<HTMLAttributes<HTMLHeadingElement>> = (props) => {
  const className = `text-2xl ${props.className ?? ""}`;

  return (
    <h2
      {...props}
      className={className}
    >{props.children}</h2>
  );
};
