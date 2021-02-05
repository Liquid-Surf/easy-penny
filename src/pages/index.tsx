import * as React from "react";
import Head from "next/head";
import { asUrl, getStringNoLocale, getUrlAll } from "@inrupt/solid-client";
import { foaf, space, vcard } from "rdf-namespaces";
import Link from "next/link";
import { Layout } from "../components/Layout";
import { SessionGate } from "../components/session/SessionGate";
import { useProfile } from "../hooks/profile";

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
      </div>
    </Layout>
  );
};

export default Home;
