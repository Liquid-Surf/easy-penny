import * as React from "react";
import { isIntegrated } from "../functions/integrate";
import { useRouter } from "next/router";
import { Explorer } from "../components/Explorer";

// This page is the only one that is available when running on a Pod server.
// It will always server the "explore" page, with the current URL as the
// URL of the Resource whose data to inspect.
// Rename this to [[...slug]].tsx and delete index.tsx to allow it to respond
// to all URLs.
const IntegratedHome: React.FC = () => {
  const router = useRouter();

  if (!isIntegrated()) {
    return null;
  }

  const cleanUrlParams = (url: string, paramsToRemove: string[]): string => {
      const urlObj = new URL(url);
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      return urlObj.toString();
  };

  const raw_url =
    typeof window !== "undefined"
      ? window.location.origin + router.basePath + router.asPath
      : undefined;

  const url = raw_url  
  	? cleanUrlParams(raw_url, ['code', 'state', 'iss']) // remove potential params remaining after authentification
  	: undefined

  return (
    <Explorer
      url={url}
      onUrlChange={(url, options) => router.push(url, undefined, options)}
    />
  );
};

export default IntegratedHome;
