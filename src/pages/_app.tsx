import { handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";
import { FC, useEffect, useState } from "react";
import Modal from "react-modal";
import { ToastContainer, cssTransition, Slide } from "react-toastify";
import { MdClose } from "react-icons/md";

import { SessionContext, SessionInfo } from "../contexts/session";
import "../../styles/globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { AppProps } from "next/app";

if (typeof document === "object") {
  const appElement = document.querySelector("#appWrapper > *:first-child") as HTMLElement;
  Modal.setAppElement(appElement);
}

const contextClass = {
  success: "bg-blue-600",
  error: "bg-red-600",
  info: "bg-gray-600",
  warning: "bg-orange-400",
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

  useEffect(() => {
    setSessionInfo(undefined);
    handleIncomingRedirect(window.location.href).then((info) => {
      if (info && info.isLoggedIn) {
        setSessionInfo(info as SessionInfo);
      } else {
        setSessionInfo(null);
      }
    });
  }, []);

  return (
    <SessionContext.Provider value={sessionInfo}>
      <Component {...pageProps} />
      <ToastContainer
        toastClassName={(props) => contextClass[props?.type ?? "default"] +
          " rounded justify-between shadow mt-5"
        }
        bodyClassName={() => "font-white block p-3 flex-grow"}
        position="bottom-left"
        closeButton={false}
        autoClose={5000}
        transition={Transition}
      />
    </SessionContext.Provider>
  );
}

export default MyApp;
