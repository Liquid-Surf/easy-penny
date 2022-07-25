import * as React from "react";
import Head from "next/head";
import { isContainer, UrlString } from "@inrupt/solid-client";
import { Layout } from "./Layout";
import { useResource } from "../hooks/resource";
import { DatasetViewer } from "./viewers/DatasetViewer";
import { ContainerViewer } from "./viewers/ContainerViewer";
import { FetchErrorViewer } from "./viewers/FetchErrorViewer";
import { FileViewer } from "./viewers/FileViewer";
import { useSessionInfo } from "../hooks/sessionInfo";
import { Spinner } from "./ui/Spinner";
import { isLoadedFileData } from "../hooks/file";
import { isLoadedDataset } from "../hooks/dataset";

interface Props {
  url?: UrlString;
}

export const Explorer: React.FC<Props> = (props) => {
  const sessionInfo = useSessionInfo();
  const resource = useResource(
    typeof props.url === "string" ? props.url : null,
    {
      // Ensure that, if we're browsing the user's profile document,
      // it's fetched as `text/turtle`. This is a workaround for ESS returning
      // HTML when no Accept header is present.
      requestContentType:
        sessionInfo && sessionInfo.webId === props.url
          ? "text/turtle"
          : undefined,
    }
  );

  const datasetViewer =
    resource !== null && isLoadedDataset(resource) ? (
      <DatasetViewer dataset={resource} />
    ) : null;

  const containerViewer =
    resource !== null &&
    isLoadedDataset(resource) &&
    isContainer(resource.data) ? (
      <ContainerViewer dataset={resource} />
    ) : null;

  const fileViewer =
    resource !== null && isLoadedFileData(resource) ? (
      <FileViewer file={resource} />
    ) : null;

  const errorViewer =
    typeof sessionInfo === "undefined" ||
    resource === null ||
    (!isLoadedDataset(resource) && resource.isValidating) ? (
      <Spinner />
    ) : (
      <FetchErrorViewer error={resource.error} />
    );

  return (
    <Layout path={props.url}>
      <Head>
        <title>Penny: {props.url}</title>
      </Head>
      <div className="lg:w-4/5 xl:w-2/3 2xl:w-1/2 mx-auto p-5 md:pt-20">
        {errorViewer}
        {containerViewer}
        {fileViewer || datasetViewer}
      </div>
    </Layout>
  );
};
