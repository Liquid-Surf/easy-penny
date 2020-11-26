import { FC } from "react";

export const Main: FC = (props) => {
  return (
    <div className="pt-5 px-5">
      {props.children}
    </div>
  );
};
