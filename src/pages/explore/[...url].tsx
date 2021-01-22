import * as React from "react";
import Head from "next/head";
import { Layout } from "../../components/Layout";
import { useRouter } from "next/router";
import { isFileUrl, isLoaded, useDataset } from "../../hooks/dataset";
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
  // by setting its type to ldp:NonRDFSource.
  // This is implementation-specific behaviour,
  // but unfortunately I don't know of a spec-described way of determining this
  // (and I've asked multiple times, but it appears to be hard to formulate the right question):
  const essFileViewer = isLoaded(dataset) && datasetThing !== null && getUrl(datasetThing, rdf.type) === ldp.NonRDFSource
    ? <FileViewer file={dataset}/>
    : null;

  // When we fetch a regular file from NSS using getSolidDataset, it throws a 500 error.
  // In `useDataset`, we explicitly catch that, check whether the URL contains a regular file,
  // and if so store that as that file's URL.
  // Again, implementation-specific behaviour in lieu of a spec-defined way to deal with this.
  const nssFileViewer = isFileUrl(dataset)
    ? <FileViewer file={dataset}/>
    : null;

  const fileViewer = nssFileViewer ?? essFileViewer ?? null;

  return (
    <Layout path={url}>
      <Head>
        <title>Penny: {url}</title>
      </Head>
      <div className="md:w-4/5 lg:w-2/3 xl:w-1/2 mx-auto p-5 md:pt-20">
        <FetchErrorViewer error={dataset.error}/>
        {containerViewer}
        {fileViewer}
        {datasetViewer}
      </div>
    </Layout>
  );
};

export default Explore;
