import { getSolidDataset, hasResourceInfo, saveSolidDatasetAt, SolidDataset, UrlString, WithResourceInfo } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useCallback } from "react";
import useSwr, { responseInterface } from "swr";
import { useSessionInfo } from "./sessionInfo";

const fetcher = async (url: UrlString, userWebId?: UrlString): Promise<SolidDataset & WithResourceInfo> => {
  const dataset = await getSolidDataset(url, { fetch: fetch });
  return dataset;
};

export type CachedDataset = responseInterface<SolidDataset & WithResourceInfo, unknown> & { save: (dataset: SolidDataset) => void };
export type LoadedCachedDataset = CachedDataset & { data: Exclude<CachedDataset['data'], undefined> };

export function isLoaded(dataset: CachedDataset): dataset is LoadedCachedDataset {
  return typeof dataset.data !== "undefined";
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

    if (hasResourceInfo(dataset)) {
      // Optimistically update local view of the data
      result.mutate(dataset, false);
    }
    const savedData = await saveSolidDatasetAt(resourceUrl, dataset, { fetch: fetch });
    // Update local data with confirmed changes from the server,
    // then refetch to fetch potential changes performed in a different tab:
    result.mutate(savedData, true);
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
