import { getContainedResourceUrlAll, getSourceUrl } from "@inrupt/solid-client";
import { FC } from "react";
import Link from "next/link";
import { LoadedCachedDataset } from "../hooks/dataset";

interface Props {
  dataset: LoadedCachedDataset;
}

export const ContainerViewer: FC<Props> = (props) => {
  let containedResources = getContainedResourceUrlAll(props.dataset.data).map(resourceUrl => {
    const name = resourceUrl.substring(getSourceUrl(props.dataset.data).length);
    return (
      <Link href={`/explore/${encodeURIComponent(resourceUrl)}`}>
        <a className="bg-coolGray-700 text-white p-5 rounded hover:bg-coolGray-900  block focus:ring-2 focus:ring-offset-2 focus:ring-coolGray-700 focus:outline-none focus:ring-opacity-50">{name}</a>
      </Link>
    );
  });

  if (containedResources.length === 0) {
    return (
      <div className="pb-10">
        <div className="rounded bg-yellow-200 p-5">
          This container is empty.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-5 pb-10">
        {containedResources}
      </div>
    </>
  );
};