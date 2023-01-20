import { UrlString } from "@inrupt/solid-client";
import { CachedResource, FileData, isFileData, useResource } from "./resource";

export type LoadedCachedFileData = CachedResource & { data: FileData } & {
  save: (file: Blob) => Promise<void>;
};

export function isLoadedFileData(
  dataset: CachedResource
): dataset is LoadedCachedFileData {
  return typeof dataset.error === "undefined" && isFileData(dataset.data);
}

export function useFile(url: UrlString): LoadedCachedFileData;
export function useFile(url: null): null;
export function useFile(url: UrlString | null): LoadedCachedFileData | null;
export function useFile(url: UrlString | null): LoadedCachedFileData | null {
  const resource = useResource(url);

  if (resource === null || !isLoadedFileData(resource)) {
    return null;
  }

  return resource;
}
