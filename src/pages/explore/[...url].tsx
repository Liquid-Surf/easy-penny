import * as React from "react";
import Head from "next/head";
import { Layout } from "../../components/Layout";
import { useRouter } from "next/router";
import { isLoaded, useDataset } from "../../hooks/dataset";
import { DatasetViewer } from "../../components/DatasetViewer";
import { getSourceUrl, getThing, getUrl, isContainer, isRawData } from "@inrupt/solid-client";
import { ContainerViewer } from "../../components/ContainerViewer";
import { FetchErrorViewer } from "../../components/FetchErrorViewer";
import { FileViewer } from "../../components/FileViewer";
import { ldp, rdf } from "rdf-namespaces";

const Explore: React.FC = () => {
  const router = useRouter();
  const url = (router.query.url as string[] ?? []).join("/");
  const dataset = useDataset(url);

  const datasetViewer = isLoaded(dataset)
    ? <DatasetViewer dataset={dataset}/>
    : null;

  const containerViewer = isLoaded(dataset) && isContainer(dataset.data)
    ? <ContainerViewer dataset={dataset}/>
    : null;

  const datasetThing = isLoaded(dataset) ? getThing(dataset.data, getSourceUrl(dataset.data)) : null;
  // ESS indicates that the loaded Resource also has a representation as a regular file
  // by setting its type to ldp:NonRDFSource:
  const fileViewer = isLoaded(dataset) && datasetThing !== null && getUrl(datasetThing, rdf.type) === ldp.NonRDFSource
    ? <FileViewer fileUrl={getSourceUrl(dataset.data)}/>
    : null;

  return (
    <Layout path={url}>
      <Head>
        <title>Penny: {url}</title>
      </Head>
      <div className="md:w-4/5 lg:w-1/2 mx-auto p-5 md:pt-20">
        <FetchErrorViewer error={dataset.error}/>
        {containerViewer}
        {fileViewer}
        {datasetViewer}
      </div>
    </Layout>
  );
};

export default Explore;
