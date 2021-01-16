import { handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";
import App from "next/app";
import { useEffect, useState } from "react";
import Modal from "react-modal";

import { SessionContext, SessionInfo } from "../contexts/session";
import "../../styles/globals.css";

if (typeof document === "object") {
  const appElement = document.querySelector("#appWrapper > *:first-child") as HTMLElement;
  Modal.setAppElement(appElement);
}

export const MyApp: App = ({ Component, pageProps }) => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);

  useEffect(() => {
    handleIncomingRedirect(window.location.href).then((info) => {
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
