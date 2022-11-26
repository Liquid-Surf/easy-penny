import * as React from "react";
import Head from "next/head";
import {
  asUrl,
  getStringNoLocale,
  getUrlAll,
  UrlString,
} from "@inrupt/solid-client";
import { foaf, space, vcard, solid } from "rdf-namespaces";
import Link from "next/link";
import { useLocalization } from "@fluent/react";
import { Layout } from "../components/Layout";
import { SessionGate } from "../components/session/SessionGate";
import { useProfile } from "../hooks/profile";
import { LoggedOut } from "../components/session/LoggedOut";
import { LoggedIn } from "../components/session/LoggedIn";
import { ClientLocalized } from "../components/ClientLocalized";

const Home: React.FC = () => {
  const profile = useProfile();
  const { l10n } = useLocalization();

  const name = profile
    ? getStringNoLocale(profile.data, foaf.name) ??
      getStringNoLocale(profile.data, vcard.fn) ??
      asUrl(profile.data)
    : null;
  const webId = profile ? asUrl(profile.data) : "";

  const storages = profile
    ? Array.from(
        new Set(
          getUrlAll(profile.data, space.storage).concat(
            getUrlAll(profile.data, solid.account)
          )
        )
      )
    : [];

  return (
    <Layout>
      <Head>
        <title>Penny</title>
      </Head>
      <div className="md:w-4/5 lg:w-1/2 mx-auto p-5 md:pt-20">
        <SessionGate>
          <ClientLocalized
            id="pod-listing-heading"
            vars={{
              "owner-name": name ?? webId,
            }}
            elems={{
              "owner-link": <OwnerLink webId={webId} />,
            }}
          >
            <h3 className="text-lg block py-5">Pod(s) of: {webId}</h3>
          </ClientLocalized>
          <ul className="space-between-5">
            {storages.map((storageUrl) => (
              <li key={storageUrl + "_storage"}>
                <Link
                  href={`/explore/?url=${encodeURIComponent(storageUrl)}`}
                  className="p-5 bg-coolGray-700 hover:bg-coolGray-900 rounded text-white block focus:ring-2 focus:ring-offset-2 focus:ring-coolGray-700 focus:outline-none focus:ring-opacity-50"
                  title={l10n.getString("pod-listing-tooltip", {
                    "pod-url": storageUrl,
                  })}
                >
                  {storageUrl}
                </Link>
              </li>
            ))}
          </ul>
        </SessionGate>
        <section className="pt-28 space-y-5">
          <ClientLocalized id="intro-title">
            <h2 className="text-xl font-bold">What is this?</h2>
          </ClientLocalized>
          <ClientLocalized
            id="intro-text"
            elems={{
              "solid-link": (
                <a
                  href="https://solidproject.org/"
                  className="underline hover:no-underline hover:bg-coolGray-700 hover:text-white focus:outline-none focus:bg-coolGray-700 focus:text-white"
                />
              ),
            }}
          >
            <p>
              Penny is a tool for developers of Solid apps. It allows you to
              inspect the data on your Pod and, if you have the appropriate
              permissions, to modify and add new data. It presumes familiarity
              with the concepts of Solid.
            </p>
          </ClientLocalized>
          <LoggedOut>
            <ClientLocalized
              id="intro-get-started-logged-out"
              elems={{
                "contact-link": (
                  <a
                    href="https://gitlab.com/vincenttunru/penny/-/issues/new"
                    className="underline hover:no-underline hover:bg-coolGray-700 hover:text-white focus:outline-none focus:bg-coolGray-700 focus:text-white"
                  />
                ),
              }}
            >
              <p>
                To get started, connect to your Pod to inspect its data, or
                manually enter a URL to inspect at the top of the page. And if
                you have feedback, please get in touch!
              </p>
            </ClientLocalized>
          </LoggedOut>
          <LoggedIn>
            <ClientLocalized
              id="intro-get-started-logged-in"
              elems={{
                "contact-link": (
                  <a
                    href="https://gitlab.com/vincenttunru/penny/-/issues/new"
                    className="underline hover:no-underline hover:bg-coolGray-700 hover:text-white focus:outline-none focus:bg-coolGray-700 focus:text-white"
                  />
                ),
              }}
            >
              <p>
                To get started, follow the links above to browse your Pod, or
                manually enter a URL to inspect at the top of the page. And if
                you have feedback, please get in touch!
              </p>
            </ClientLocalized>
          </LoggedIn>
          <footer>—Vincent</footer>
        </section>
      </div>
    </Layout>
  );
};

const OwnerLink = (props: { webId: UrlString; children?: React.ReactNode }) => (
  <>
    <Link
      href={`/explore/?url=${encodeURIComponent(
        props.webId
      )}#${encodeURIComponent(props.webId)}`}
      className="font-bold hover:text-coolGray-700 focus:underline focus:text-coolGray-700 focus:outline-none"
    >
      {props.children}
    </Link>
  </>
);

export default Home;
