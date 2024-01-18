import { FC, HTMLAttributes, ReactNode } from "react";

export const PageTitle: FC<HTMLAttributes<HTMLHeadingElement>> = (props) => {
  const className = `text-2xl ${props.className ?? ""}`;

  return (
    <h2 {...props} className={className}>
      {props.children}
    </h2>
  );
};

export const SectionHeading = (props: { children: ReactNode }) => {
  return (
    <div className="pb-5">
      <h3 className="w-3/4 border-b-4 border-gray-700 pt-5 text-2xl font-bold">
        {props.children}
      </h3>
    </div>
  );
};
