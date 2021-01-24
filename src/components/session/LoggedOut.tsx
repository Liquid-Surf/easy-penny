import { FC } from "react";
import { useSessionInfo } from "../../hooks/sessionInfo";

export const LoggedOut: FC = (props) => {
  const sessionInfo = useSessionInfo();

  if (sessionInfo === null) {
    return <>{props.children}</>;
  }
  
  return null;
};