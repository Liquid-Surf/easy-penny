import * as React from "react";
import Head from "next/head";
import { Router } from "next/router";
import { isContainer, UrlString } from "@inrupt/solid-client";
import { VscListTree } from "react-icons/vsc";
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
import { TreeView } from "./TreeView";
import { useRoot } from "../hooks/root";
import * as storage from "../functions/localStorage";
import { useL10n } from "../hooks/l10n";

/** Next.js doesn't export this type, at the time of writing: */
export type TransitionOptions = Parameters<Router["push"]>[2];
interface Props {
  url?: UrlString;
  onUrlChange: (url: UrlString, options?: TransitionOptions) => void;
}

export const Explorer: React.FC<Props> = (props) => {
  const l10n = useL10n();
  const root = useRoot(props.url ?? null);
  const resource = useResource(
    typeof props.url === "string" ? props.url : null
  );
  const sessionInfo = useSessionInfo();
  const [isTreeViewExpanded, setIsTreeViewExpanded] = React.useState(
    storage.getItem("expand-tree-view") === "true"
  );

  React.useEffect(() => {
    if (isTreeViewExpanded) {
      storage.setItem("expand-tree-view", "true");
    } else {
      storage.removeItem("expand-tree-view");
    }
  }, [isTreeViewExpanded]);

  const datasetViewer = isLoadedDataset(resource) ? (
    <DatasetViewer dataset={resource} />
  ) : null;

  const containerViewer =
    isLoadedDataset(resource) && isContainer(resource.data) ? (
      <ContainerViewer dataset={resource} />
    ) : null;

  const fileViewer = isLoadedFileData(resource) ? (
    <FileViewer file={resource} />
  ) : null;

  const errorViewer =
    typeof sessionInfo === "undefined" ||
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
      <div
        className={`items-stretch grid transition-[grid-template-columns] ease ${
          isTreeViewExpanded ? "duration-1000" : "duration-500"
        } ${
          root && isTreeViewExpanded
            ? `grid-cols-[0fr_50px_1fr] lg:grid-cols-[2fr_50px_7fr]`
            : `grid-cols-[0fr_50px_1fr]`
        } pr-[50px]`}
      >
        <div className="py-10 basis-96 min-w-0 overflow-hidden text-ellipsis">
          {root && (
            <div className="hidden lg:block pl-2 py-5 h-full bg-gray-50">
              <TreeView
                root={root}
                onExplore={(url) => props.onUrlChange(url, { scroll: false })}
                currentUrl={props.url ? removeHash(props.url) : undefined}
              />
            </div>
          )}
        </div>
        <div className="py-10">
          {root && (
            <button
              onClick={() => setIsTreeViewExpanded(!isTreeViewExpanded)}
              className={`hidden lg:flex p-2 h-full items-start rounded-r-md border-2 bg-gray-50 border-gray-200 border-l-transparent duration-500 hover:bg-gray-700 hover:text-white ${
                isTreeViewExpanded
                  ? "border-transparent border-r-gray-200 hover:border-r-gray-900 focus-visible:border-gray-700"
                  : ""
              }`}
              title={l10n.getString(
                isTreeViewExpanded
                  ? "tree-collapse-button-tooltip"
                  : "tree-expand-button-tooltip"
              )}
            >
              <VscListTree
                aria-label={l10n.getString(
                  isTreeViewExpanded
                    ? "tree-collapse-button-label"
                    : "tree-expand-button-label"
                )}
              />
            </button>
          )}
        </div>
        <div className={"mx-auto p-5 md:pt-10 w-full xl:w-[50rem]"}>
          {errorViewer}
          {containerViewer}
          {fileViewer ?? datasetViewer}
        </div>
      </div>
    </Layout>
  );
};

function removeHash(url: UrlString) {
  const urlObj = new URL(url);
  urlObj.hash = "";
  return urlObj.href;
}
