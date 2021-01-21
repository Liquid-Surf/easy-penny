import { FC, FormEventHandler, useEffect, useState } from "react";
import Link from "next/link";
import { UrlString } from "@inrupt/solid-client";
import { useRouter } from "next/router";
import { LocationBar } from "./LocationBar";
import { SubmitButton, TextField } from "./ui/forms";
import { SigninButton } from "./UserMenu";
import { VscTwitter } from "react-icons/vsc";
import { SiMastodon, SiGitlab } from "react-icons/si";

interface Props {
  path?: UrlString;
}

export const Layout: FC<Props> = (props) => {
  const [isEditingPath, setIsEditingPath] = useState(false);
  const router = useRouter();

  const locationBar = props.path && !isEditingPath
    ? <h2 className="flex-grow py-8 text-md md:text-lg lg:text-xl"><LocationBar location={props.path} onEdit={() => setIsEditingPath(true)}/></h2>
    : <UrlBar path={props.path}/>;

  
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      setIsEditingPath(false);
    }

    router.events.on("routeChangeStart", handleRouteChange)
    router.events.on("hashChangeStart", handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteChange)
      router.events.off("hashChangeStart", handleRouteChange)
    }
  }, [])

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <header className="bg-coolGray-50">
          <div className="container mx-auto flex items-center px-5 py-8">
            <h1 className="hidden pr-10 md:mr-0 md:block text-xl md:text-2xl">
              <Link href="/">
                <a className="focus:underline focus:text-coolGray-700 focus:outline-none">Penny</a>
              </Link>
            </h1>
            {locationBar}
            <div className="pl-5 md:pl-10 flex items-center">
              <SigninButton/>
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto">
          {props.children}
        </main>
        <footer
          className="px-8 py-14"
        >
          <div className="flex items-center space-x-3 justify-center border-coolGray-50 border-t-2 pt-10 text-coolGray-700">
            <span>By <a href="https://VincentTunru.com" className="border-coolGray-700 border-b-2 hover:text-coolGray-900 hover:border-b-4">Vincent Tunru</a>.</span>
            <a
              href="https://twitter.com/VincentTunru"
              title="Vincent on Twitter"
              className="text-coolGray-500 p-2 border-2 border-white rounded hover:text-coolGray-700 hover:border-coolGray-700 focus:outline-none focus:text-coolGray-700 focus:border-coolGray-700"
            >
              <VscTwitter aria-label="On Twitter"/>
            </a>
            <a
              href="https://mastodon.social/@Vinnl"
              title="Vincent on Mastodon"
              className="text-coolGray-500 p-2 border-2 border-white rounded hover:text-coolGray-700 hover:border-coolGray-700 focus:outline-none focus:text-coolGray-700 focus:border-coolGray-700"
            >
              <SiMastodon aria-label="On Mastodon"/>
            </a>
            <a
              href="https://gitlab.com/VincentTunru/Penny/"
              title="Source code on GitLab"
              className="text-coolGray-500 p-2 border-2 border-white rounded hover:text-coolGray-700 hover:border-coolGray-700 focus:outline-none focus:text-coolGray-700 focus:border-coolGray-700"
            >
              <SiGitlab aria-label="Source code"/>
            </a>
          </div>
        </footer>
      </div>
    </>
  );
};

interface UrlBarProps {
  path?: UrlString;
}
const UrlBar: FC<UrlBarProps> = (props) => {
  const router = useRouter();
  const [url, setUrl] = useState(props.path ?? "");

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    router.push(`/explore/${encodeURIComponent(url)}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex-grow flex items-center space-x-3 w-full">
      <label htmlFor="urlInput" className="hidden md:inline">URL:</label>
      <TextField type="url" name="urlInput" id="urlInput" value={url} onChange={setUrl} className="w-full p-2"/>
      <SubmitButton value="Go" className="px-5 py-2"/>
    </form>
  );
};
