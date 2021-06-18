import { FetchError, getContentType, getEffectiveAccess, getResourceInfo, getSolidDataset, hasResourceInfo, hasServerResourceInfo, isRawData, responseToResourceInfo, responseToSolidDataset, saveSolidDatasetAt, SolidDataset, solidDatasetAsMarkdown, UrlString } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useCallback } from "react";
import useSwr, { responseInterface } from "swr";
import { useSessionInfo } from "./sessionInfo";

export type FileInfo = {
  url: UrlString;
  contentType: string | null;
};

const fetcher = async (url: UrlString): Promise<FileInfo | (SolidDataset & WithServerResourceInfo)> => {
  const response = await fetch(url);
  const resourceInfo = responseToResourceInfo(response);
  if(isRawData(resourceInfo)) {
    return {
      url: url,
      contentType: getContentType(resourceInfo),
    };
  }
  const dataset = await responseToSolidDataset(response);
  return dataset;
};

// Unfortunately solid-client doesn't currently export this type.
// While awaiting that, this is a workaround to obtain it:
export type WithServerResourceInfo = Parameters<typeof getEffectiveAccess>[0];
export type CachedDataset = responseInterface<(SolidDataset & WithServerResourceInfo) | FileInfo, FetchError> & { save: (dataset: SolidDataset) => Promise<void> };
export type LoadedCachedDataset = CachedDataset & { data: Exclude<CachedDataset['data'], undefined | FileInfo> & WithServerResourceInfo };
export type LoadedCachedFileInfo = CachedDataset & { data: FileInfo };

export function isLoaded(dataset: CachedDataset): dataset is LoadedCachedDataset {
  return typeof dataset.error === "undefined" && typeof dataset.data !== "undefined" && typeof (dataset.data as FileInfo).url === "undefined";
}
function isFileInfo(data?: object): data is FileInfo {
  return typeof data === "object" &&
    typeof (data as FileInfo).url === "string" &&
    ((data as FileInfo).contentType === null || typeof (data as FileInfo).contentType === "string");
}
export function isLoadedCachedFileInfo(dataset: CachedDataset): dataset is LoadedCachedFileInfo {
  return typeof dataset.error === "undefined" && isFileInfo(dataset.data);
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
