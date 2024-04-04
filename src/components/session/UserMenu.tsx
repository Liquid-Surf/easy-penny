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
import {
  getAssetLink,
  getExplorePath,
  isIntegrated,
} from "../../functions/integrate";
import { useL10n } from "../../hooks/l10n";
import { connect } from "../../functions/connect";

export const UserMenu: FC = () => {
  const [promptOpen, setPromptOpen] = useState(false);
  const sessionInfo = useSessionInfo();
  const l10n = useL10n();

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
          base: "mx-auto rounded bg-white p-5 shadow-lg transition-opacity duration-150 motion-safe:opacity-0 md:p-10",
          afterOpen: "motion-safe:opacity-100",
          beforeClose: "",
        }}
        closeTimeoutMS={150}
      >
        <div className="-mr-4 -mt-4 flex flex-row-reverse md:-mr-8 md:-mt-8">
          <button onClick={() => setPromptOpen(false)}>
            <MdClose aria-label={l10n.getString("connectmodal-close-label")} />
          </button>
        </div>
        <ConnectForm />
      </Modal>
    );
  }

  const profileLink =
    sessionInfo &&
    (!isIntegrated() ||
      new URL(sessionInfo.webId).origin === document.location.origin) ? (
      <Link
        href={getExplorePath(sessionInfo.webId)}
        className="items-center whitespace-nowrap border-b-2 border-gray-200 p-2 hover:rounded hover:border-gray-700 hover:bg-gray-700 hover:text-white focus:border-gray-700 focus:outline-none sm:hidden lg:flex"
      >
        {l10n.getString("profile-button")}
      </Link>
    ) : null;

  const manageAccountLink = (
    <button
      className="mx-2 items-center whitespace-nowrap border-b-2 border-gray-200 p-2 hover:rounded hover:border-gray-700 hover:bg-gray-700 hover:text-white focus:border-gray-700 focus:outline-none sm:hidden lg:flex"
      onClick={(e) => {
        document.location.href = "/.account/account/";
      }}
    >
      Your account
    </button>
  );
  const connectButton = (
    <button
      className="mx-2 ml-3 flex items-center whitespace-nowrap rounded-lg border-2 border-coolGray-200 px-1 py-1 hover:border-coolGray-700 hover:bg-coolGray-700 hover:text-white focus:border-coolGray-700 focus:outline-none md:px-2"
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
  );

  const connectButtonIntegrated = (
    <button
      className="mx-2 ml-3 flex items-center whitespace-nowrap rounded-lg border-2 border-coolGray-200 px-1 py-1 hover:border-coolGray-700 hover:bg-coolGray-700 hover:text-white focus:border-coolGray-700 focus:outline-none md:px-2"
      onClick={async (e) => {
        e.preventDefault();
        let issuer =
          typeof document !== "undefined"
            ? document.location.protocol + "//" + document.location.host
            : null;
        try {
          console.log("issuer=" + issuer);
          if (issuer) await connect(issuer);
        } catch (e) {
          console.log("couldnt connect to issuer..");
          console.log(e);
          // TODO Catch error correctly ( check ConnectForm )
        }
      }}
      title={l10n.getString("connect-button-tooltip")}
    >
      <span aria-hidden="true" className="px-2 md:inline">
        {l10n.getString("login-button")}
      </span>
    </button>
  );

  const registerButton = (
    <button
      className="mx-2 items-center whitespace-nowrap border-b-2 border-coolGray-200 p-2 hover:rounded hover:border-coolGray-700 hover:bg-coolGray-700 hover:text-white focus:border-coolGray-700 focus:outline-none lg:flex"
      onClick={(e) => {
        // document.location.href = "/account/register/";
        document.location.href = "/.account/login/password/register/";
      }}
      title={l10n.getString("connect-button-tooltip")}
    >
      <span aria-hidden="true" className="px-2 md:inline">
        Register
      </span>
    </button>
  );

  const disconnectButton = (
    <button
      className="mx-2 flex items-center whitespace-nowrap rounded-lg border-2 border-gray-200 px-1 py-1 hover:border-gray-700 hover:bg-gray-700 hover:text-white focus:border-gray-700 focus:outline-none md:px-2"
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
  );

  const editProfile = (
    <Link
      href="/account/profile"
      className="items-center whitespace-nowrap border-b-2 border-gray-200 p-2 hover:rounded hover:border-gray-700 hover:bg-gray-700 hover:text-white focus:border-gray-700 focus:outline-none sm:hidden lg:flex"
    >
      Edit Profile {/* TODO l10n */}
    </Link>
  );

  return (
    <>
      <LoggedOut>
        {isIntegrated() ? registerButton : null}
        {isIntegrated() ? connectButtonIntegrated : connectButton}
      </LoggedOut>
      <LoggedIn>
        <div className="flex space-x-5"></div>
        <div className="flex space-x-5">
          {/*isIntegrated() ? manageAccountLink : null // see #1*/}
          {profileLink}
          {/* sessionInfo && isIntegrated() ? editProfile : null */}
        </div>
        {disconnectButton}
      </LoggedIn>
    </>
  );
};
