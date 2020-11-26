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
      <div className="md:w-4/5 lg:w-1/2 mx-auto pt-5 md:pt-20">
        <SessionGate>
          Welcome {info?.webId}!
        </SessionGate>
      </div>
    </Layout>
  );
};

export default Home;
