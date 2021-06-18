import { getSourceUrl, hasServerResourceInfo, saveSolidDatasetAt, SolidDataset, UrlString, WithServerResourceInfo } from "@inrupt/solid-client";
import { useCallback } from "react";
import { CachedResource, FileData, useResource } from "./resource";

export type LoadedCachedDataset = CachedResource & { data: Exclude<CachedResource['data'], undefined | FileData> & WithServerResourceInfo } & { save: (dataset: SolidDataset) => Promise<void> };

export function isLoadedDataset(dataset: CachedResource): dataset is LoadedCachedDataset {
  return typeof dataset.error === "undefined" && typeof dataset.data !== "undefined" && typeof (dataset.data as FileData).blob === "undefined";
}

export function useDataset (url: UrlString): LoadedCachedDataset;
export function useDataset (url: null): null;
export function useDataset (url: UrlString | null): LoadedCachedDataset | null;
export function useDataset (url: UrlString | null): LoadedCachedDataset | null {
	const resource = useResource(url);

	if (resource === null || !isLoadedDataset(resource)) {
		return null;
	}

  const update = useCallback(async (dataset: SolidDataset) => {
    if (hasServerResourceInfo(dataset)) {
      // Optimistically update local view of the data
      resource.mutate(dataset, false);
    }
    try {
      const savedData = await saveSolidDatasetAt(getSourceUrl(resource.data), dataset, { fetch: fetch });
      // Update local data with confirmed changes from the server,
      // then refetch to fetch potential changes performed in a different tab:
      resource.mutate(savedData, true);
    } catch (e) {
      await resource.revalidate();
      throw e;
    }
  }, [url, resource]);

  const cached: LoadedCachedDataset = {
    ...resource,
    save: update,
  };

  return cached;
}