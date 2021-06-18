import { SolidDataset, UrlString, WithServerResourceInfo } from "@inrupt/solid-client";
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

  return resource;
}
