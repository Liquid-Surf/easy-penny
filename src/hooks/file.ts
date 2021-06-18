import { getSourceUrl, hasServerResourceInfo, overwriteFile, UrlString } from "@inrupt/solid-client";
import { useCallback } from "react";
import { CachedResource, FileData, isFileData, useResource } from "./resource";

export type LoadedCachedFileData = CachedResource & { data: FileData } & { save: (dataset: Blob) => Promise<void> };

export function isLoadedFileData(dataset: CachedResource): dataset is LoadedCachedFileData {
  return typeof dataset.error === "undefined" && isFileData(dataset.data);
}

export function useFile (url: UrlString): LoadedCachedFileData;
export function useFile (url: null): null;
export function useFile (url: UrlString | null): LoadedCachedFileData | null;
export function useFile (url: UrlString | null): LoadedCachedFileData | null {
	const resource = useResource(url);

	if (resource === null || !isLoadedFileData(resource)) {
		return null;
	}

  const update = useCallback(async (file: Blob) => {
    if (hasServerResourceInfo(resource)) {
      // Optimistically update local view of the data
      resource.mutate({
        ...resource,
        blob: file,
        etag: null,
      }, false);
    }
    try {
      await overwriteFile(getSourceUrl(resource.data), file, { fetch: fetch });
      // // Refetch to obtain ETag:
      // resource.mutate();
    } catch (e) {
      await resource.revalidate();
      throw e;
    }
  }, [url, resource]);

  const cached: LoadedCachedFileData = {
    ...resource,
    save: update,
  };

  return cached;
}
