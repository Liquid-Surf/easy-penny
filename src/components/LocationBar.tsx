import { UrlString } from "@inrupt/solid-client";
import { FC, Fragment } from "react";
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
      <Fragment key={pathUrl}>
        &nbsp;/&nbsp;
        <Link
          href={`/explore/${encodeURIComponent(pathUrl)}`}
        >
          <a className="focus:underline focus:text-coolGray-700 focus:outline-none">{resourceName}</a>
        </Link>
      </Fragment>
    );
  }).slice(1);

  return (
    <>
      <Link href={`/explore/${encodeURIComponent(url.origin)}/`}>
        <a className="focus:underline focus:text-coolGray-700 focus:outline-none">{url.hostname}</a>
      </Link>
      {pathElements}
    </>
  );
};