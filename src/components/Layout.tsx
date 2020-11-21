import { FC } from "react";

export const Layout: FC = (props) => {

  return (
    <main>
      {props.children}
    </main>
  );
};