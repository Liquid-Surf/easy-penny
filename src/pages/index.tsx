import * as React from "react";
import Head from "next/head";
import { asUrl, getStringNoLocale, getUrlAll } from "@inrupt/solid-client";
import { foaf, space, vcard } from "rdf-namespaces";
import Link from "next/link";
import { Layout } from "../components/Layout";
import { SessionGate } from "../components/session/SessionGate";
import { useProfile } from "../hooks/profile";
import { LoggedOut } from "../components/session/LoggedOut";
import { LoggedIn } from "../components/session/LoggedIn";

const Home: React.FC = () => {
  const profile = useProfile();

  const name = profile
    ? getStringNoLocale(profile.data, foaf.name) ?? getStringNoLocale(profile.data, vcard.fn) ?? asUrl(profile.data)
    : null;
  const webId = profile ? asUrl(profile.data) : "";

  const storages = profile ? getUrlAll(profile.data, space.storage) : [];

  return (
    <Layout>
      <Head>
        <title>Penny</title>
      </Head>
      <div className="md:w-4/5 lg:w-1/2 mx-auto p-5 md:pt-20">
        <SessionGate>
          <h3 className="text-lg block py-5">
            Pod(s) of:&nbsp;
            <Link href={`/explore/?url=${encodeURIComponent(webId)}#${encodeURIComponent(webId)}`}>
              <a className="font-bold hover:text-coolGray-700 focus:underline focus:text-coolGray-700 focus:outline-none">{name}</a>
            </Link>
          </h3>
          <ul className="space-between-5">
            {storages.map(storageUrl => (
              <li key={storageUrl + "_storage"}>
                <Link href={`/explore/?url=${encodeURIComponent(storageUrl)}`}>
                  <a className="p-5 bg-coolGray-700 hover:bg-coolGray-900 rounded text-white block focus:ring-2 focus:ring-offset-2 focus:ring-coolGray-700 focus:outline-none focus:ring-opacity-50">{storageUrl}</a>
                </Link>
              </li>
            ))}
          </ul>
        </SessionGate>
        <section className="pt-28 space-y-5">
          <h2 className="text-xl font-bold">
            What is this?
          </h2>
          <p>
            Penny is a tool for developers of&nbsp;
            <a
              href="https://solidproject.org/"
              className="underline hover:no-underline hover:bg-coolGray-700 hover:text-white focus:outline-none focus:bg-coolGray-700 focus:text-white"
            >Solid</a>
            &nbsp;apps. It allows you to inspect the data on your Pod and, if you have the appropriate permissions, to modify and add new data. It presumes familiarity with the concepts of Solid.
          </p>
          <LoggedOut>
            <p>
              To get started, connect to your Pod to inspect its data, or manually enter a URL to inspect at the top of the page. And if you have feedback, please&nbsp;
              <a
                href="https://gitlab.com/vincenttunru/penny/-/issues/new"
                className="underline hover:no-underline hover:bg-coolGray-700 hover:text-white focus:outline-none focus:bg-coolGray-700 focus:text-white"
              >get in touch</a>!
            </p>
          </LoggedOut>
          <LoggedIn>
            <p>
              To get started, follow the links above to browse your Pod, or manually enter a URL to inspect at the top of the page. And if you have feedback, please&nbsp;
              <a
                href="https://gitlab.com/vincenttunru/penny/-/issues/new"
                className="underline hover:no-underline hover:bg-coolGray-700 hover:text-white focus:outline-none focus:bg-coolGray-700 focus:text-white"
              >get in touch</a>!
            </p>
          </LoggedIn>
          <footer>
            —Vincent
          </footer>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
