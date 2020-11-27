import * as React from "react";
import Head from "next/head";
import { Layout, } from "../components/Layout";
import { SessionGate } from "../components/SessionGate";
import { useProfile } from "../hooks/profile";
import { getStringNoLocale } from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";

const Home: React.FC = () => {
  const profile = useProfile();

  const name = profile ? getStringNoLocale(profile.data, foaf.name) : "you";

  return (
    <Layout>
      <Head>
        <title>Listomania</title>
      </Head>
      <div className="md:w-4/5 lg:w-1/2 mx-auto pt-5 md:pt-20">
        <SessionGate>
          Welcome {name}!
        </SessionGate>
      </div>
    </Layout>
  );
};

export default Home;
