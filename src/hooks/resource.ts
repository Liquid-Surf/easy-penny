import { FetchError, isRawData, responseToResourceInfo, responseToSolidDataset, SolidDataset, UrlString, WithServerResourceInfo } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import useSwr, { responseInterface } from "swr";
import { useSessionInfo } from "./sessionInfo";

export type FileData = WithServerResourceInfo & {
  blob: Blob;
  etag: string | null;
};

const fetcher = async (url: UrlString): Promise<FileData | (SolidDataset & WithServerResourceInfo)> => {
  const response = await fetch(url);
  const resourceInfo = responseToResourceInfo(response);
  if(isRawData(resourceInfo)) {
    return {
      ...resourceInfo,
      blob: await response.blob(),
      etag: response.headers.get("ETag"),
    };
  }
  const dataset = await responseToSolidDataset(response);
  return dataset;
};

export type CachedResource = responseInterface<(SolidDataset & WithServerResourceInfo) | FileData, FetchError>;

export function isFileData(data?: object): data is FileData {
  return typeof data === "object" &&
    typeof (data as FileData).blob === "object";
}

export function useResource (url: UrlString): CachedResource;
export function useResource (url: null): null;
export function useResource (url: UrlString | null): CachedResource | null;
export function useResource (url: UrlString | null): CachedResource | null {
  const resourceUrl = url ? getResourceUrl(url) : null;
  const sessionInfo = useSessionInfo();
  const result = useSwr([resourceUrl, sessionInfo?.webId], fetcher);

  return result;
}

function getResourceUrl(url: UrlString): UrlString {
  const resourceUrl = new URL(url);
  resourceUrl.hash = "";
  return resourceUrl.href;
}
