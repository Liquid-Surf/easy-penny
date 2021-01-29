import { FC } from "react";
import { isIntegrated } from "../../functions/integrate";

export const Integrated: FC = (props) => {
  if (isIntegrated()) {
    return <>{props.children}</>;
  }
  return null;
}