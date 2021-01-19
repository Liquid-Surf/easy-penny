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

export const SectionHeading: FC = (props) => {
  return (
    <div className="pb-5">
      <h3 className="pt-5 text-2xl font-bold border-b-4 border-coolGray-700 w-3/4">
        {props.children}
      </h3>
    </div>
  );
};
