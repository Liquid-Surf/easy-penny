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
import { SiMastodon, SiGitlab } from "react-icons/si";
import { getExplorePath } from "../functions/integrate";
import { NotIntegrated } from "./integrated/NotIntegrated";
import { ClientLocalized } from "./ClientLocalized";
import { useL10n } from "../hooks/l10n";
import { Footer } from "./Footer"

interface Props {
  children: ReactNode;
  path?: UrlString;
}

export const Layout = (props: Props) => {
  const [isEditingPath, setIsEditingPath] = useState(false);
  const router = useRouter();
  const l10n = useL10n();

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
      <div className="flex min-h-screen flex-col">
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
  const l10n = useL10n();
  const [url, setUrl] = useState(
    props.path ? decodeURIComponent(props.path) : "",
  );

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const normalisedUrl = normaliseUrlInput(url, props.path);
    if (normalisedUrl === null) {
      const urlField = e.target;
      if (urlField instanceof HTMLInputElement) {
        urlField.setCustomValidity(l10n.getString("urlbar-error-invalid"));
        urlField.reportValidity();
      }
      return;
    }
    const targetPath = getExplorePath(encodeURI(normalisedUrl));
    router.push(targetPath);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-grow items-center space-x-3 py-1"
    >
      <ClientLocalized id="urlbar-label">
        <label htmlFor="urlInput" className="hidden md:inline">
          URL:
        </label>
      </ClientLocalized>
      <TextField
        // Not of type `url`, so the user can enter e.g. "../":
        type="text"
        name="urlInput"
        id="urlInput"
        value={url}
        placeholder="https://&hellip;"
        autoFocus={true}
        onChange={setUrl}
        className="w-full p-2"
        required={true}
        autoComplete="url"
        inputMode="url"
      />
      <ClientLocalized id="urlbar-button-label" attrs={{ value: true }}>
        <SubmitButton value="Go" className="px-5 py-2" />
      </ClientLocalized>
    </form>
  );
};

function normaliseUrlInput(
  input: string,
  baseUrl?: UrlString,
): UrlString | null {
  const trimmedInput = input.trim();
  try {
    const normalisedUrl = new URL(trimmedInput, baseUrl);
    return normalisedUrl.href;
  } catch (e) {
    return null;
  }
}
