import {
  getLinkedResourceUrlAll,
  getResourceInfo,
  getSourceUrl,
  UrlString,
} from "@inrupt/solid-client";
import { space } from "rdf-namespaces";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useEffect, useState } from "react";

export function useRoot(url: null): null;
export function useRoot(url: UrlString | null): UrlString | undefined | null;
export function useRoot(url: UrlString | null): UrlString | undefined | null {
  const [root, setRoot] = useState<string | undefined | null>();

  useEffect(() => {
    if (typeof url !== "string") {
      setRoot(null);
      return;
    }
    getRoot(url).then((root) => {
      setRoot(root);
    });
  }, [url]);

  return root;
}

async function getRoot(url: UrlString): Promise<UrlString | undefined | null> {
  try {
    const resourceInfo = await getResourceInfo(url, { fetch: fetch });

    if (
      resourceInfo &&
      getLinkedResourceUrlAll(resourceInfo)
        ["type"]?.map((url) => url.toLowerCase())
        .includes(space.storage.toLowerCase())
    ) {
      return getSourceUrl(resourceInfo);
    }

    const parentUrl = getParentUrl(url);
    if (!parentUrl) {
      return null;
    }

    return getRoot(parentUrl);
  } catch {
    return null;
  }
}

function getParentUrl(url: UrlString | null): UrlString | null {
  if (url === null) {
    return null;
  }
  const urlObject = new URL(url);
  const path = urlObject.pathname;
  if (path === "/") {
    return null;
  }

  const pathWithoutTrailingSlash = path.endsWith("/")
    ? path.substring(0, path.length - 1)
    : path;
  const parentPath = pathWithoutTrailingSlash.substring(
    0,
    pathWithoutTrailingSlash.lastIndexOf("/")
  );

  return urlObject.origin + parentPath + "/";
}
