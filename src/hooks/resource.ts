import { FetchError, getContentType, getEffectiveAccess, getResourceInfo, getSolidDataset, hasResourceInfo, hasServerResourceInfo, isRawData, responseToResourceInfo, responseToSolidDataset, saveSolidDatasetAt, SolidDataset, solidDatasetAsMarkdown, UrlString, WithResourceInfo } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useCallback } from "react";
import useSwr, { responseInterface } from "swr";
import { useSessionInfo } from "./sessionInfo";

export type FileData = WithServerResourceInfo & {
  blob: Blob;
};

const fetcher = async (url: UrlString): Promise<FileData | (SolidDataset & WithServerResourceInfo)> => {
  const response = await fetch(url);
  const resourceInfo = responseToResourceInfo(response);
  if(isRawData(resourceInfo)) {
    return {
      ...resourceInfo,
      blob: await response.blob(),
    };
  }
  const dataset = await responseToSolidDataset(response);
  return dataset;
};

// Unfortunately solid-client doesn't currently export this type.
// While awaiting that, this is a workaround to obtain it:
export type WithServerResourceInfo = Parameters<typeof getEffectiveAccess>[0];
export type CachedDataset = responseInterface<(SolidDataset & WithServerResourceInfo) | FileData, FetchError> & { save: (dataset: SolidDataset) => Promise<void> };
export type LoadedCachedDataset = CachedDataset & { data: Exclude<CachedDataset['data'], undefined | FileData> & WithServerResourceInfo };
export type LoadedCachedFileData = CachedDataset & { data: FileData };

export function isLoaded(dataset: CachedDataset): dataset is LoadedCachedDataset {
  return typeof dataset.error === "undefined" && typeof dataset.data !== "undefined" && typeof (dataset.data as FileData).blob === "undefined";
}
function isFileData(data?: object): data is FileData {
  return typeof data === "object" &&
    typeof (data as FileData).blob === "object";
}
export function isLoadedCachedFileInfo(dataset: CachedDataset): dataset is LoadedCachedFileData {
  return typeof dataset.error === "undefined" && isFileData(dataset.data);
}

export function useDataset (url: UrlString): CachedDataset;
export function useDataset (url: null): null;
export function useDataset (url: UrlString | null): CachedDataset | null;
export function useDataset (url: UrlString | null): CachedDataset | null {
  const resourceUrl = url ? getResourceUrl(url) : null;
  const sessionInfo = useSessionInfo();
  const result = useSwr([resourceUrl, sessionInfo?.webId], fetcher);

  const update = useCallback(async (dataset: SolidDataset) => {
    if (!resourceUrl) {
      return;
    }

    if (hasServerResourceInfo(dataset)) {
      // Optimistically update local view of the data
      result.mutate(dataset, false);
    }
    try {
      const savedData = await saveSolidDatasetAt(resourceUrl, dataset, { fetch: fetch });
      // Update local data with confirmed changes from the server,
      // then refetch to fetch potential changes performed in a different tab:
      result.mutate(savedData, true);
    } catch (e) {
      await result.revalidate();
      throw e;
    }
  }, [resourceUrl, result]);

  const cached: CachedDataset = {
    ...result,
    save: update,
  };

  return cached;
}

function getResourceUrl(url: UrlString): UrlString {
  const resourceUrl = new URL(url);
  resourceUrl.hash = "";
  return resourceUrl.href;
}
