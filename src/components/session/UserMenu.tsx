import { FC, useState } from "react";
import Modal from "react-modal";
import { LoggedIn } from "./LoggedIn";
import { LoggedOut } from "./LoggedOut";
import { ConnectForm } from "./ConnectForm";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import * as storage from "../../functions/localStorage";
import { useSessionInfo } from "../../hooks/sessionInfo";
import { logout } from "@inrupt/solid-client-authn-browser";
import { getAssetLink, getExplorePath } from "../../functions/integrate";
import { useLocalization } from "@fluent/react";
import { connect } from "../../functions/connect";

export const UserMenu: FC = () => {
  const [promptOpen, setPromptOpen] = useState(false);
  const sessionInfo = useSessionInfo();
  const { l10n } = useLocalization();

  if (promptOpen) {
    return (
      <Modal
        isOpen={promptOpen}
        onRequestClose={() => setPromptOpen(false)}
        contentLabel={l10n.getString("connectmodal-label")}
        overlayClassName={{
          base: "transition-opacity duration-150 motion-safe:opacity-0 bg-opacity-90 bg-gray-900 p-5 md:py-20 md:px-40 lg:px-60 xl:px-96 fixed top-0 left-0 right-0 bottom-0 overscroll-contain",
          afterOpen: "motion-safe:opacity-100",
          beforeClose: "",
        }}
        className={{
          base: "transition-opacity duration-150 motion-safe:opacity-0 bg-white shadow-lg mx-auto p-5 md:p-10 rounded",
          afterOpen: "motion-safe:opacity-100",
          beforeClose: "",
        }}
        closeTimeoutMS={150}
      >
        <div className="flex flex-row-reverse -mt-4 -mr-4 md:-mt-8 md:-mr-8">
          <button onClick={() => setPromptOpen(false)}>
            <MdClose aria-label={l10n.getString("connectmodal-close-label")} />
          </button>
        </div>
        <ConnectForm />
      </Modal>
    );
  }

  const profileLink = sessionInfo ? (
    <Link
      href={getExplorePath(
        sessionInfo.webId,
        encodeURIComponent(sessionInfo.webId)
      )}
      className="sm:hidden lg:flex whitespace-nowrap p-2 border-b-2 hover:rounded border-gray-200 items-center hover:bg-gray-700 hover:text-white hover:border-gray-700 focus:border-gray-700 focus:outline-none"
    >
      {l10n.getString("profile-button")}
    </Link>
  ) : null;

  return <>
    <LoggedOut>
      <button
        className="lg:flex whitespace-nowrap p-2 border-b-2 hover:rounded border-coolGray-200 items-center hover:bg-coolGray-700 hover:text-white hover:border-coolGray-700 focus:border-coolGray-700 focus:outline-none"
        onClick={(e) => {
          document.location.href = '/idp/register/'
        }}
        title={l10n.getString("connect-button-tooltip")}
      >
        <span aria-hidden="true" className="px-2 md:inline">
          Register
        </span>
      </button>
      <button
        className="whitespace-nowrap px-1 md:px-2 py-1 border-2 border-coolGray-200 rounded-lg flex items-center hover:bg-coolGray-700 hover:text-white hover:border-coolGray-700 focus:border-coolGray-700 focus:outline-none ml-3"
        onClick={(e) => {
          e.preventDefault();
          setPromptOpen(true);
        }}
        title={l10n.getString("connect-button-tooltip")}
      >
        <span aria-hidden="true" className="px-2 md:inline">
          {l10n.getString("connect-button")}
        </span>
      </button>
      <button
        className="whitespace-nowrap px-1 md:px-2 py-1 border-2 border-coolGray-200 rounded-lg flex items-center hover:bg-coolGray-700 hover:text-white hover:border-coolGray-700 focus:border-coolGray-700 focus:outline-none ml-3"
        onClick={async (e) => {
          e.preventDefault();
          let issuer = 
            typeof document !== "undefined" 
            	? document.location.protocol + '//' + document.location.host
            	: null
            try {
              console.log("issuer=" + issuer)
              issuer = "http://localhost:3055" // TODO remove me
              await connect(issuer)
            } catch(e) {
              console.log("couldnt connect to issuer..")
              console.log(e)
              // TODO Catch error correctly ( check ConnectForm ) 
            }
        }}
        title={l10n.getString("connect-button-tooltip")}
      >
        <span aria-hidden="true" className="px-2 md:inline">
          {l10n.getString("connect-button") + " direct"}
        </span>
      </button>
    </LoggedOut>
    <LoggedIn>
      <div className="flex space-x-5">
        {profileLink}
        <button
          className="whitespace-nowrap px-1 md:px-2 py-1 border-2 border-gray-200 rounded-lg flex items-center hover:bg-gray-700 hover:text-white hover:border-gray-700 focus:border-gray-700 focus:outline-none"
          onClick={(e) => {
            e.preventDefault();
            storage.setItem("autoconnect", "false");
            logout();
          }}
          title={l10n.getString("disconnect-button-tooltip", {
            webId: sessionInfo?.webId ?? "",
          })}
        >
          <span className="w-8">
            <img
              width={352 / 10}
              height={322 / 10}
              alt=""
              src={getAssetLink("/solid-emblem.svg")}
              aria-hidden="true"
            />
          </span>
          <span className="px-2">{l10n.getString("disconnect-button")}</span>
        </button>
      </div>
    </LoggedIn>
  </>;
};
