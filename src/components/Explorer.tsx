import * as React from "react";
import Head from "next/head";
import { ldp, rdf } from "rdf-namespaces";
import { getSourceUrl, getThing, getUrl, isContainer, UrlString } from "@inrupt/solid-client";
import { Layout } from "./Layout";
import { isLoadedCachedFileInfo, isLoaded, useDataset } from "../hooks/dataset";
import { DatasetViewer } from "./viewers/DatasetViewer";
import { ContainerViewer } from "./viewers/ContainerViewer";
import { FetchErrorViewer } from "./viewers/FetchErrorViewer";
import { FileViewer } from "./viewers/FileViewer";

interface Props {
  url?: UrlString;
}

export const Explorer: React.FC<Props> = (props) => {
  if (typeof props.url === "undefined") {
    return null;
  }
  const dataset = useDataset(props.url);

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
  const nssFileViewer = isLoadedCachedFileInfo(dataset)
    ? <FileViewer file={dataset}/>
    : null;

  const fileViewer = nssFileViewer ?? essFileViewer ?? null;

  return (
    <Layout path={props.url}>
      <Head>
        <title>Penny: {props.url}</title>
      </Head>
      <div className="lg:w-4/5 xl:w-2/3 2xl:w-1/2 mx-auto p-5 md:pt-20">
        <FetchErrorViewer error={dataset.error}/>
        {containerViewer}
        {fileViewer || datasetViewer}
      </div>
    </Layout>
  );
};
