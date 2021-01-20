import { FC, FormEventHandler, useState } from "react";
import Link from "next/link";
import { UrlString } from "@inrupt/solid-client";
import { useRouter } from "next/router";
import { LocationBar } from "./LocationBar";
import { SubmitButton, TextField } from "./ui/forms";
import { SigninButton } from "./UserMenu";

interface Props {
  path?: UrlString;
}

export const Layout: FC<Props> = (props) => {
  const locationBar = props.path
    ? <h2 className="flex-grow py-8 px-10 md:px-20 text-md md:text-lg lg:text-xl"><LocationBar location={props.path}/></h2>
    : <UrlBar/>;

  return (
    <>
      <header className="bg-gray-50">
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
      <main className="container mx-auto">
        {props.children}
      </main>
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
