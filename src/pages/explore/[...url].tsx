import * as React from "react";
import Head from "next/head";
import { Layout } from "../../components/Layout";
import { useRouter } from "next/router";
import { isLoaded, useDataset } from "../../hooks/dataset";
import { DatasetViewer } from "../../components/DatasetViewer";
import { isContainer } from "@inrupt/solid-client";
import { ContainerViewer } from "../../components/ContainerViewer";

const Explore: React.FC = () => {
  const router = useRouter();
  const url = (router.query.url as string[] ?? []).join("");
  const dataset = useDataset(url);

  const viewer = isLoaded(dataset)
    ? <DatasetViewer dataset={dataset}/>
    : <span>Loading…</span>;

  const container = isLoaded(dataset) && isContainer(dataset.data)
    ? <ContainerViewer dataset={dataset}/>
    : null;

  return (
    <Layout path={url}>
      <Head>
        <title>Sodeto</title>
      </Head>
      <div className="md:w-4/5 lg:w-1/2 mx-auto pt-5 md:pt-20">
        {container}
        {viewer}
      </div>
    </Layout>
  );
};

export default Explore;
