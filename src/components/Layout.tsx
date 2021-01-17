import { FC } from "react";
import Link from "next/link";
import { UrlString } from "@inrupt/solid-client";
import { LocationBar } from "./LocationBar";

interface Props {
  path?: UrlString;
}

export const Layout: FC<Props> = (props) => {
  const locationBar = props.path
    ? <h2 className="py-8 px-20 text-xl"><LocationBar location={props.path}/></h2>
    : null;

  return (
    <>
      <header className="bg-gray-50">
        <div className="container mx-auto flex px-5">
          <h1 className="py-8 text-2xl">
            <Link href="/">
              <a className="focus:underline focus:text-coolGray-700 focus:outline-none">Sodeto</a>
            </Link>
          </h1>
          {locationBar}
        </div>
      </header>
      <main className="container mx-auto">
        {props.children}
      </main>
    </>
  );
};