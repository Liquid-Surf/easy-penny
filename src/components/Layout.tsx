import React, {
  FC,
  FormEventHandler,
  ReactNode,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { UrlString } from "@inrupt/solid-client";
import { useRouter } from "next/router";
import { LocationBar } from "./LocationBar";
import { SubmitButton, TextField } from "./ui/forms";
import { UserMenu } from "./session/UserMenu";
import { VscTwitter } from "react-icons/vsc";
import { SiMastodon, SiGitlab } from "react-icons/si";
import { getExplorePath } from "../functions/integrate";
import { NotIntegrated } from "./integrated/NotIntegrated";
import { useLocalization } from "@fluent/react";
import { ClientLocalized } from "./ClientLocalized";
import { Footer } from "./Footer"

interface Props {
  children: ReactNode;
  path?: UrlString;
}

export const Layout = (props: Props) => {
  const [isEditingPath, setIsEditingPath] = useState(false);
  const router = useRouter();
  const { l10n } = useLocalization();

  const locationBarClass =
    props.path && props.path.length > 100
      ? "lg:text-md xl:text-lg"
      : "md:text-lg lg:text-xl";
  const locationBar =
    props.path && !isEditingPath ? (
      <h2 className={`text-md ${locationBarClass}`}>
        <LocationBar
          location={props.path}
          onEdit={() => setIsEditingPath(true)}
        />
      </h2>
    ) : (
      <NotIntegrated>
        <UrlBar path={props.path} />
      </NotIntegrated>
    );

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      setIsEditingPath(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);
    router.events.on("hashChangeStart", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      router.events.off("hashChangeStart", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <header className="bg-gray-50">
          <div className="container mx-auto flex flex-col-reverse items-start sm:flex-row md:items-center space-y-5 md:space-y-0 px-5 pb-8 sm:pt-5 md:pt-8">
            <div className="flex-grow w-full">{locationBar}</div>
            <div className="pl-5 md:pl-10 flex self-end items-center py-2">
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto">{props.children}</main>
      </div>
    </>
  );
};

interface UrlBarProps {
  path?: UrlString;
}
const UrlBar: FC<UrlBarProps> = (props) => {
  const router = useRouter();
  const [url, setUrl] = useState(
    props.path ? decodeURIComponent(props.path) : ""
  );

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const targetPath = getExplorePath(encodeURI(url));
    router.push(targetPath);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex-grow flex items-center py-1 space-x-3 w-full"
    >
      <ClientLocalized id="urlbar-label">
        <label htmlFor="urlInput" className="hidden md:inline">
          URL:
        </label>
      </ClientLocalized>
      <TextField
        type="url"
        name="urlInput"
        id="urlInput"
        value={url}
        placeholder="https://&hellip;"
        autoFocus={true}
        onChange={setUrl}
        className="w-full p-2"
      />
      <ClientLocalized id="urlbar-button-label" attrs={{ value: true }}>
        <SubmitButton value="Go" className="px-5 py-2" />
      </ClientLocalized>
    </form>
  );
};
