import * as React from "react";
import Head from "next/head";
import { Layout } from "../components/Layout";
import { SessionGate } from "../components/SessionGate";
import { useProfile } from "../hooks/profile";
import { asUrl, getStringNoLocale } from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";
import Link from "next/link";

const Home: React.FC = () => {
  const profile = useProfile();

  const name = profile ? getStringNoLocale(profile.data, foaf.name) : "you";
  const webId = profile ? asUrl(profile.data) : "";

  return (
    <Layout>
      <Head>
        <title>Sodeto</title>
      </Head>
      <div className="md:w-4/5 lg:w-1/2 mx-auto pt-5 md:pt-20">
        <SessionGate>
          Welcome {name}!
          <Link href={`/explore/${encodeURIComponent(webId)}`}>
            <a>Profile</a>
          </Link>
        </SessionGate>
      </div>
    </Layout>
  );
};

export default Home;
