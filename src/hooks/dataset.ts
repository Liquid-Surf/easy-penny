import { FetchError, getResourceInfo, getSolidDataset, hasResourceInfo, isRawData, saveSolidDatasetAt, SolidDataset, solidDatasetAsMarkdown, UrlString, WithResourceInfo } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useCallback } from "react";
import useSwr, { responseInterface } from "swr";
import { useSessionInfo } from "./sessionInfo";

const fetcher = async (url: UrlString): Promise<UrlString | SolidDataset & WithResourceInfo> => {
  try {
    const dataset = await getSolidDataset(url, { fetch: fetch });
    return dataset;
  } catch (e) {
    if (e instanceof FetchError && e.statusCode === 500) {
      // When we call `getSolidDataset()` against a non-RDF source in NSS,
      // it returns a 500 Internal Server Error.
      // To enable detecting that it is a regular file that we can offer for download,
      // we set the data to that file's URL if it is.
      // Unfortunately, in lieu of a spec-defined way to determine whether a Resource has a
      // non-RDF representation, we need implementation-specific workarounds like this:
      const resourceInfo = await getResourceInfo(url, { fetch: fetch });
      if(isRawData(resourceInfo)) {
        return url;
      }
    }
    throw e;
  }
};

// Unfortunately SolidDatasets are currently still an oblique object that cannot be easily compared
// (I'm lobbying to change this, but it's hard!), so until then we'll have to do this manual kludge:
function compareSolidDatasets(a?: SolidDataset | UrlString, b?: SolidDataset | UrlString): boolean {
  if (typeof a === "undefined") {
    return typeof b === "undefined";
  }
  if (typeof b === "undefined") {
    return typeof a === "undefined";
  }
  if (typeof a === "string") {
    return typeof b === "string" && a === b;
  }
  if (typeof b === "string") {
    return typeof a === "string" && a === b;
  }
  return solidDatasetAsMarkdown(a) === solidDatasetAsMarkdown(b);
}

export type CachedDataset = responseInterface<SolidDataset & WithResourceInfo | UrlString, FetchError> & { save: (dataset: SolidDataset) => Promise<void> };
export type LoadedCachedDataset = CachedDataset & { data: Exclude<CachedDataset['data'], undefined | UrlString> };
export type LoadedCachedFileUrl = CachedDataset & { data: UrlString };

export function isLoaded(dataset: CachedDataset): dataset is LoadedCachedDataset {
  return typeof dataset.data !== "undefined" && typeof dataset.data !== "string";
}
export function isFileUrl(dataset: CachedDataset): dataset is LoadedCachedFileUrl {
  return typeof dataset.data === "string";
}

export function useDataset (url: UrlString): CachedDataset;
export function useDataset (url: null): null;
export function useDataset (url: UrlString | null): CachedDataset | null;
export function useDataset (url: UrlString | null): CachedDataset | null {
  const resourceUrl = url ? getResourceUrl(url) : null;
  const sessionInfo = useSessionInfo();
  const result = useSwr([resourceUrl, sessionInfo?.webId], fetcher, { compare: compareSolidDatasets });

  const update = useCallback(async (dataset: SolidDataset) => {
    if (!resourceUrl) {
      return;
    }

    if (hasResourceInfo(dataset)) {
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
