import * as React from "react";
import Head from "next/head";
import { Layout, } from "../components/Layout";
import { SessionGate } from "../components/SessionGate";
import { useSessionInfo } from "../hooks/sessionInfo";

const Home: React.FC = () => {
  const info = useSessionInfo();

  return (
    <Layout>
      <Head>
        <title>Listomania</title>
      </Head>
      <SessionGate>
        Welcome {info?.webId}!
      </SessionGate>
    </Layout>
  );
};

export default Home;
