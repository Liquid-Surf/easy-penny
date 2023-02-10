import * as React from "react";
import { useState } from "react";
import Head from "next/head";
import { isContainer, UrlString } from "@inrupt/solid-client";
import { Layout } from "./Layout";
import { useResource } from "../hooks/resource";
import { DatasetViewer } from "./viewers/DatasetViewer";
import { Card } from "./viewers/Card";
import { ContainerViewer } from "./viewers/ContainerViewer";
import { FetchErrorViewer } from "./viewers/FetchErrorViewer";
import { FileViewer } from "./viewers/FileViewer";
import { useSessionInfo } from "../hooks/sessionInfo";
import { Spinner } from "./ui/Spinner";
import { isLoadedFileData } from "../hooks/file";
import { isLoadedDataset } from "../hooks/dataset";

interface Props {
  url: UrlString;
}

export const Explorer: React.FC<Props> = (props) => {
  const [showAdvanced, setShow] = useState(false);
  const resource = useResource(
    typeof props.url === "string" ? props.url : null
  );
  const sessionInfo = useSessionInfo();

  const toggleShowAdvanced = (currentValue: boolean) => {
    setShow(!currentValue);
  };

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

  const card =
    resource !== null &&
    (props.url.slice(-4) == "card" || props.url.slice(-7) == "card#me") ? (
      <Card webidUrl={props.url} dataset={resource} />
    ) : null;

  return (
    <Layout path={props.url}>
      <Head>
        <title>Penny: {props.url}</title>
      </Head>
      <div className="lg:w-4/5 xl:w-2/3 2xl:w-1/2 mx-auto p-5 md:pt-20">
        <div className="flex flex-row-reverse pb-4">
          <button className="" onClick={() => setShow(!showAdvanced)}>
            <span>{showAdvanced ? "Hide" : "Show"} advanced options </span>
            <svg
              className="inline"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" />
            </svg>
          </button>
        </div>
        {errorViewer}
        {containerViewer}
        {card}
        <div id="advanced-options" class={showAdvanced ? "open p-4" : ""}>
          {fileViewer || (showAdvanced ? datasetViewer : null)}
        </div>
        <div
          id="overlay"
          class={showAdvanced ? "open" : ""}
          onClick={() => setShow(!showAdvanced)}
        ></div>
      </div>
    </Layout>
  );
};
