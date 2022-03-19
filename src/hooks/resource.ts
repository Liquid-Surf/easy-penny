import {
  FetchError,
  getSourceUrl,
  hasServerResourceInfo,
  isRawData,
  overwriteFile,
  responseToResourceInfo,
  responseToSolidDataset,
  saveSolidDatasetAt,
  SolidDataset,
  UrlString,
  WithServerResourceInfo,
} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useCallback } from "react";
import useSwr, { SWRResponse } from "swr";
import { useSessionInfo } from "./sessionInfo";

export type FileData = WithServerResourceInfo & {
  blob: Blob;
  etag: string | null;
};

const fetcher = async (
  url: UrlString
): Promise<FileData | (SolidDataset & WithServerResourceInfo)> => {
  const urlObject = new URL(url);
  // Ensure that when we fetch a Container that contains an `index.html`,
  // the server doesn't serve us that HTML file:
  const headers = new Headers(
    urlObject.pathname.endsWith("/") ? { Accept: "text/turtle" } : {}
  );
  const response = await fetch(url, { headers: headers });
  const resourceInfo = responseToResourceInfo(response);
  if (isRawData(resourceInfo)) {
    return {
      ...resourceInfo,
      blob: await response.blob(),
      etag: response.headers.get("ETag"),
    };
  }
  const dataset = await responseToSolidDataset(response);
  return dataset;
};

export type CachedResource = SWRResponse<
  (SolidDataset & WithServerResourceInfo) | FileData,
  FetchError
> & { save: (resource: SolidDataset | Blob) => Promise<void> };

export function isFileData(data?: Record<string, unknown>): data is FileData {
  return (
    typeof data === "object" && typeof (data as FileData).blob === "object"
  );
}

export function useResource(url: UrlString): CachedResource;
export function useResource(url: null): null;
export function useResource(url: UrlString | null): CachedResource | null;
export function useResource(url: UrlString | null): CachedResource | null {
  const resourceUrl = url ? getResourceUrl(url) : null;
  const sessionInfo = useSessionInfo();
  const resource = useSwr(
    resourceUrl ? [resourceUrl, sessionInfo?.webId] : null,
    fetcher
  );

  const update = useCallback(
    async (newResource: SolidDataset | Blob) => {
      if (hasServerResourceInfo(resource.data)) {
        // Optimistically update local view of the data
        if (newResource instanceof Blob) {
          resource.mutate(
            {
              ...resource.data,
              blob: newResource,
              etag: null,
            },
            false
          );
          try {
            await overwriteFile(getSourceUrl(resource.data), newResource, {
              fetch: fetch,
            });
          } catch (e) {
            await resource.mutate();
            throw e;
          }
        } else {
          if (hasServerResourceInfo(newResource)) {
            resource.mutate(newResource, false);
          }
          try {
            const savedData = await saveSolidDatasetAt(
              getSourceUrl(resource.data),
              newResource,
              { fetch: fetch }
            );
            // Update local data with confirmed changes from the server,
            // then refetch to fetch potential changes performed in a different tab:
            resource.mutate(savedData, true);
          } catch (e) {
            await resource.mutate();
            throw e;
          }
        }
      }
    },
    [resource]
  );

  const cached: CachedResource = {
    ...resource,
    save: update,
  };

  return cached;
}

function getResourceUrl(url: UrlString): UrlString {
  const resourceUrl = new URL(url);
  resourceUrl.hash = "";
  return resourceUrl.href;
}
