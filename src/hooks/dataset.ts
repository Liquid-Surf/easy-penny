import { FetchError, getContentType, getEffectiveAccess, getResourceInfo, getSolidDataset, hasResourceInfo, hasServerResourceInfo, isRawData, saveSolidDatasetAt, SolidDataset, solidDatasetAsMarkdown, UrlString } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useCallback } from "react";
import useSwr, { responseInterface } from "swr";
import { useSessionInfo } from "./sessionInfo";

export type FileInfo = {
  url: UrlString;
  contentType: string | null;
};

const fetcher = async (url: UrlString): Promise<FileInfo | (SolidDataset & WithServerResourceInfo)> => {
  try {
    const dataset = await getSolidDataset(url, { fetch: fetch });
    return dataset;
  } catch (e) {
    if (e instanceof FetchError && [406, 500, 501].includes(e.statusCode)) {
      // When we call `getSolidDataset()` against a non-RDF source in NSS,
      // it returns a 500 Internal Server Error.
      // Likewise, CSS currently returns a 501 Not Implemented error (though it will likely switch
      // to a 406 or a 200 with as-yet unknown body.)
      // And ESS, in its turn, returns 406 Not Acceptable.
      // To enable detecting that it is a regular file that we can offer for download,
      // we set the data to that file's URL if it is.
      // Unfortunately, in lieu of a spec-defined way to determine whether a Resource has a
      // non-RDF representation, we need implementation-specific workarounds like this.
      const resourceInfo = await getResourceInfo(url, { fetch: fetch });
      if(isRawData(resourceInfo)) {
        return {
          url: url,
          contentType: getContentType(resourceInfo),
        };
      }
    }
    throw e;
  }
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
