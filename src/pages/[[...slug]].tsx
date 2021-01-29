import * as React from "react";
import { isIntegrated } from "../functions/integrate";
import { useRouter } from "next/router";
import { Explorer } from "../components/Explorer";

// This page is the only one that is available when running on a Pod server.
// It will always server the "explore" page, with the current URL as the
// URL of the Resource whose data to inspect.
const IntegratedHome: React.FC = () => {
  const router = useRouter();

  if (!isIntegrated()) {
    return null;
  }

  const url = typeof window !== "undefined"
    ? window.location.origin + router.basePath + router.asPath
    : undefined;
  return <Explorer url={url}/>;
};

export default IntegratedHome;
