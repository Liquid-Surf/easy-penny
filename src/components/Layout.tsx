import { FC, FormEventHandler, useEffect, useState } from "react";
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

interface Props {
  path?: UrlString;
}

export const Layout: FC<Props> = (props) => {
  const [isEditingPath, setIsEditingPath] = useState(false);
  const router = useRouter();

  const locationBarClass = props.path && props.path.length > 100
    ? "lg:text-md xl:text-lg"
    : "md:text-lg lg:text-xl"
  const locationBar = props.path && !isEditingPath
    ? <h2 className={`text-md ${locationBarClass}`}><LocationBar location={props.path} onEdit={() => setIsEditingPath(true)}/></h2>
    : <NotIntegrated><UrlBar path={props.path}/></NotIntegrated>;

  
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
          <div className="container mx-auto flex flex-col-reverse items-start sm:flex-row md:items-center space-y-5 md:space-y-0 px-5 py-8">
            <h1 className="hidden pr-10 md:mr-0 md:block text-xl md:text-2xl">
              <Link href="/">
                <a className="focus:underline focus:text-coolGray-700 focus:outline-none font-bold py-3 px-5 border-t-8 border-b-8 border-coolGray-50 hover:bg-white hover:border-red-500 hover:text-red-500">Penny</a>
              </Link>
            </h1>
            <div className="flex-grow w-full">
              {locationBar}
            </div>
            <div className="pl-5 md:pl-10 flex self-end items-center py-2">
              <UserMenu/>
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
    const targetPath = getExplorePath(url);
    router.push(targetPath);
  };

  return (
    <form onSubmit={onSubmit} className="flex-grow flex items-center py-1 space-x-3 w-full">
      <label htmlFor="urlInput" className="hidden md:inline">URL:</label>
      <TextField type="url" name="urlInput" id="urlInput" value={url} placeholder="https://&hellip;" onChange={setUrl} className="w-full p-2"/>
      <SubmitButton value="Go" className="px-5 py-2"/>
    </form>
  );
};
