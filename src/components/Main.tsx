import { ReactNode } from "react";

export const Main = (props: { children: ReactNode }) => {
  return <div className="pt-5 px-5">{props.children}</div>;
};
