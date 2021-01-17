import { UrlString } from "@inrupt/solid-client";
import { FC } from "react";
import Link from "next/link";

interface Props {
  location: UrlString;
}

export const LocationBar: FC<Props> = (props) => {
  const url = new URL(props.location);

  const pathParts = url.pathname.split("/");
  const pathElements = pathParts.map((resourceName, i) => {
    let pathUrl = url.origin + pathParts.slice(0, i + 1).join("/");
    if (pathUrl.length < props.location.length) {
      pathUrl += "/";
    }
    return (
      <>
        <span key={pathUrl + "separator"} className="mx-1">/</span>
        <Link
          key={pathUrl}
          href={`/explore/${encodeURIComponent(pathUrl)}`}
        >
          <a key={pathUrl} className="focus:underline focus:text-coolGray-700 focus:outline-none break-words">{resourceName}</a>
        </Link>
      </>
    );
  }).slice(1, url.pathname.endsWith("/") ? pathParts.length - 1 : pathParts.length);

  return (
    <>
      <Link key={url.origin} href={`/explore/${encodeURIComponent(url.origin)}/`}>
        <a className="focus:underline focus:text-coolGray-700 focus:outline-none">{url.hostname}</a>
      </Link>
      {pathElements}
    </>
  );
};