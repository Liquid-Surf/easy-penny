import { FC } from "react";
import { isIntegrated } from "../../functions/integrate";

export const NotIntegrated: FC = (props) => {
  if (isIntegrated()) {
    return null;
  }
  return <>{props.children}</>;
}