import { FC } from "react";
import { useSessionInfo } from "../hooks/sessionInfo";

export const LoggedIn: FC = (props) => {
  const sessionInfo = useSessionInfo();

  if (!sessionInfo) {
    return null;
  }

  return <>{props.children}</>;
};