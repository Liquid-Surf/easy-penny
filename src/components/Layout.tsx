import { FC, FormEventHandler, useState } from "react";
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
  const locationBar = props.path
    ? <h2 className="flex-grow py-8 px-10 md:px-20 text-md md:text-lg lg:text-xl"><LocationBar location={props.path}/></h2>
    : <UrlBar/>;

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <header className="bg-coolGray-50">
          <div className="container mx-auto flex px-5">
            <h1 className="py-8 text-xl md:text-2xl">
              <Link href="/">
                <a className="focus:underline focus:text-coolGray-700 focus:outline-none">Penny</a>
              </Link>
            </h1>
            {locationBar}
            <div className="flex items-center">
              <SigninButton/>
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto">
          {props.children}
        </main>
        <footer
          className="px-48 py-14"
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

const UrlBar: FC = () => {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    router.push(`/explore/${encodeURIComponent(url)}`);
  };

  return (
    <form onSubmit={onSubmit} className="px-20 flex-grow flex items-center space-x-3 w-full">
      <label htmlFor="urlInput">URL:</label>
      <TextField type="url" name="urlInput" id="urlInput" value={url} onChange={setUrl} className="w-full p-2"/>
      <SubmitButton value="Go" className="px-5 py-2"/>
    </form>
  );
};
