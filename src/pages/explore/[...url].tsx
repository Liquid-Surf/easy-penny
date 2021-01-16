import * as React from "react";
import Head from "next/head";
import { Layout } from "../../components/Layout";
import { useRouter } from "next/router";
import { isLoaded, useDataset } from "../../hooks/dataset";
import { DatasetViewer } from "../../components/DatasetViewer";

const Explore: React.FC = () => {
  const router = useRouter();
  const url = (router.query.url as [string])[0];
  const dataset = useDataset(url);

  const viewer = isLoaded(dataset)
    ? <DatasetViewer dataset={dataset}/>
    : <span>Loading…</span>;

  return (
    <Layout path={url}>
      <Head>
        <title>Sodeto</title>
      </Head>
      <div className="md:w-4/5 lg:w-1/2 mx-auto pt-5 md:pt-20">
        {viewer}
      </div>
    </Layout>
  );
};

export default Explore;
