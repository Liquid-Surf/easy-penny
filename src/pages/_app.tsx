import { handleIncomingRedirect, onLogout, onSessionRestore } from "@inrupt/solid-client-authn-browser";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import React, { FC, useEffect, useState } from "react";
import Modal from "react-modal";
import { ToastContainer, cssTransition, Slide } from "react-toastify";
import { MdClose } from "react-icons/md";

import { SessionContext, SessionInfo } from "../contexts/session";
import "../../styles/globals.css";
import 'react-toastify/dist/ReactToastify.css';
import * as storage from "../functions/localStorage";
import { LocalizationProvider } from "@fluent/react";
import { getL10n } from "../functions/getL10n";

if (typeof document === "object") {
  const appElement = document.querySelector("#appWrapper > *:first-child") as HTMLElement;
  Modal.setAppElement(appElement);
}

const contextClass = {
  success: "bg-blue-600",
  error: "bg-red-600",
  info: "bg-gray-600",
  warning: "bg-orange-400 text-black",
  default: "bg-coolGray-700 text-white",
  dark: "bg-white-600 text-gray-300",
};

const ToastCloseButton = <MdClose className="flex-shrink" aria-label="Close"/>;
const motionMediaQueryList = process.browser ? window.matchMedia("(prefers-reduced-motion)") : undefined;
const Transition = motionMediaQueryList?.matches
  ? cssTransition({
    enter: "none",
    exit: "none",
  })
  : Slide;

export const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null | undefined>(null);
  const router = useRouter();

  useEffect(() => {
    setSessionInfo(undefined);
    handleIncomingRedirect({ restorePreviousSession: false, useEssSession: false }).then((info) => {
      if (info && info.isLoggedIn) {
        const lastAttemptedIdp = storage.getItem("last-attempted-idp");
        if (typeof lastAttemptedIdp === "string") {
          storage.setItem("last-successful-idp", lastAttemptedIdp);
        }
        setSessionInfo(info as SessionInfo);
      } else {
        setSessionInfo(null);
      }
    });
    onLogout(() => setSessionInfo(null));
    onSessionRestore((currentUrl) => {
      router.replace(currentUrl);
    })
  }, []);

  return (
    <SessionContext.Provider value={sessionInfo}>
      <LocalizationProvider l10n={getL10n()}>
        <Component {...pageProps} />
        <ToastContainer
          toastClassName={(props) => contextClass[props?.type ?? "default"] +
            " rounded justify-between shadow mt-5"
          }
          bodyClassName={() => "font-white block p-3 flex-grow leading-5"}
          position="bottom-left"
          closeButton={false}
          autoClose={5000}
          transition={Transition}
        />
      </LocalizationProvider>
    </SessionContext.Provider>
  );
}

export default MyApp;
