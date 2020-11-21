import App from "next/app";
import { useEffect, useState } from "react";

import "../../styles/globals.css";
import { SessionContext, SessionInfo } from "../contexts/session";
import { getSession } from "../session";

const session = getSession();
export const MyApp: App = ({ Component, pageProps }) => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  useEffect(() => {
    session.handleIncomingRedirect(window.location.href).then((info) => {
      if (info && info.isLoggedIn) {
        setSessionInfo(info as SessionInfo);
      }
    });
  }, []);

  return (
    <SessionContext.Provider value={sessionInfo}>
      <Component {...pageProps} />
    </SessionContext.Provider>
  );
}

export default MyApp;
